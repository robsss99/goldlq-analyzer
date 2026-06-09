// app/api/bias/route.ts
// Server-side API route untuk generate/serve XAUUSD Daily Bias
// Strategy: cache di Supabase, refresh tiap 4 jam. Pro-only.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { BIAS_SYSTEM_PROMPT, BIAS_USER_PROMPT } from "@/lib/biasPrompt";

// ── Config ──────────────────────────────────────────────
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 jam
const MODEL = "claude-sonnet-4-5"; // samakan dengan model yang kamu pakai
const MAX_AGENTIC_ITERATIONS = 8;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ── Helper: cek apakah user "Pro" (login + aktif + belum expired) ────
// Di GoldLQ, semua user yang login = sudah bayar (punya access_code).
// "Pro" = is_active TRUE DAN expires_at belum lewat.
async function getUserStatus(req: NextRequest): Promise<{ isPro: boolean; username?: string }> {
  const username = req.cookies.get("goldlq_session")?.value;
  if (!username) return { isPro: false };

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("username, is_active, expires_at")
    .eq("username", username)
    .maybeSingle();

  if (error || !data) return { isPro: false };

  const notExpired = new Date(data.expires_at) > new Date();
  const isPro = data.is_active === true && notExpired;
  return { isPro, username: data.username };
}

// ── Helper: extract JSON dari teks ──────────────────────
function extractJSON(text: string): any | null {
  if (!text) return null;
  let raw = text.trim().replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

// ── Helper: panggil Claude dengan web search (agentic loop) ──
async function generateBias(dateStr: string): Promise<any> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: BIAS_USER_PROMPT(dateStr) },
  ];

  for (let i = 0; i < MAX_AGENTIC_ITERATIONS; i++) {
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2500,
      system: BIAS_SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 8 } as any],
      messages,
    });

    // Cari JSON valid di text blocks
    const textBlocks = resp.content.filter((b: any) => b.type === "text") as any[];
    for (const block of textBlocks) {
      const parsed = extractJSON(block.text);
      if (parsed && parsed.bias && parsed.confidence) return parsed;
    }

    // Kalau Claude selesai (end_turn) tapi belum ada JSON valid → error
    if (resp.stop_reason === "end_turn") {
      const allText = textBlocks.map((b) => b.text).join("\n");
      const parsed = extractJSON(allText);
      if (parsed && parsed.bias) return parsed;
      throw new Error("AI tidak menghasilkan JSON bias yang valid");
    }

    // Kalau perlu tool (web search), SDK handle otomatis untuk server tools.
    // Tapi web_search adalah server-side tool — hasilnya sudah di-resolve oleh API,
    // jadi kita cukup push assistant message dan lanjut loop bila pause_turn.
    if (resp.stop_reason === "pause_turn" || resp.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: resp.content });
      // Untuk server-side tools (web_search), tidak perlu kirim tool_result manual.
      // Lanjutkan dengan meminta Claude menyelesaikan.
      messages.push({
        role: "user",
        content: "Lanjutkan dan keluarkan JSON bias final sesuai schema.",
      });
      continue;
    }

    break;
  }

  throw new Error("Gagal generate bias setelah beberapa percobaan");
}

// ── GET: ambil bias dari cache (tanpa generate) ─────────
export async function GET(req: NextRequest) {
  const { isPro } = await getUserStatus(req);
  if (!isPro) {
    return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
  }

  const { data } = await supabaseAdmin
    .from("bias_cache")
    .select("bias_data, generated_at")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ cached: false, data: null });
  }

  const ageMs = Date.now() - new Date(data.generated_at).getTime();
  return NextResponse.json({
    cached: true,
    stale: ageMs > CACHE_TTL_MS,
    generated_at: data.generated_at,
    data: data.bias_data,
  });
}

// ── POST: generate bias (pakai cache kalau masih fresh) ──
export async function POST(req: NextRequest) {
  const { isPro, username } = await getUserStatus(req);
  if (!isPro) {
    return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
  }

  // 1. Cek cache terbaru
  const { data: cached } = await supabaseAdmin
    .from("bias_cache")
    .select("bias_data, generated_at")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cached) {
    const ageMs = Date.now() - new Date(cached.generated_at).getTime();
    if (ageMs < CACHE_TTL_MS) {
      // Cache masih fresh → return tanpa API call (GRATIS)
      return NextResponse.json({
        cached: true,
        fresh: true,
        generated_at: cached.generated_at,
        data: cached.bias_data,
      });
    }
  }

  // 2. Cache stale / kosong → generate baru
  try {
    const dateStr = new Date().toUTCString();
    const biasData = await generateBias(dateStr);

    // 3. Simpan ke cache
    const { error: insertErr } = await supabaseAdmin.from("bias_cache").insert({
      bias_data: biasData,
      generated_by: username ?? null,
    });
    if (insertErr) console.error("Cache insert error:", insertErr);

    return NextResponse.json({
      cached: false,
      fresh: true,
      generated_at: new Date().toISOString(),
      data: biasData,
    });
  } catch (e: any) {
    // Kalau generate gagal tapi ada cache lama, return cache lama daripada error
    if (cached) {
      return NextResponse.json({
        cached: true,
        fresh: false,
        generated_at: cached.generated_at,
        data: cached.bias_data,
        warning: "Pakai data lama, generate baru gagal",
      });
    }
    return NextResponse.json(
      { error: e.message || "Gagal generate bias" },
      { status: 500 }
    );
  }
}
