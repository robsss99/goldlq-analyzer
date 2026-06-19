// app/api/calendar/impact/route.ts
// Analisa impact event ekonomi ke XAUUSD (on-click, di-cache per event).
// PENTING: Forex Factory JSON tidak menyediakan angka Actual yang reliable,
// jadi kita pakai Claude + web search untuk mencari hasil aktual terbaru,
// lalu analisa dampaknya ke gold.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

const MODEL = "claude-sonnet-4-5";
const MAX_ITER = 6;
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

async function getUserStatus(req: NextRequest): Promise<{ isPro: boolean }> {
  const username = req.cookies.get("goldlq_session")?.value;
  if (!username) return { isPro: false };
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("is_active, expires_at")
    .eq("username", username)
    .maybeSingle();
  if (error || !data) return { isPro: false };
  return { isPro: data.is_active === true && new Date(data.expires_at) > new Date() };
}

const IMPACT_SYSTEM = `Kamu analis XAUUSD (emas) profesional. Diberikan satu event ekonomi USD, gunakan web search untuk mencari ANGKA ACTUAL terbaru dari event itu (kalau sudah rilis), lalu analisa dampaknya ke harga emas (XAUUSD).

Cari di web: angka actual hasil rilis, bandingkan dengan forecast. Kalau event ternyata belum rilis, set "released": false.

Output HANYA JSON valid (tanpa markdown), schema:
{
  "released": true | false,
  "actual_found": "<angka actual yang ditemukan dari web, atau kosong kalau belum rilis>",
  "surprise": "BEAT" | "MISS" | "INLINE" | "PENDING",
  "usd_reaction": "USD_STRONGER" | "USD_WEAKER" | "NEUTRAL",
  "gold_impact": "BULLISH" | "BEARISH" | "NEUTRAL",
  "magnitude": "HIGH" | "MEDIUM" | "LOW",
  "explanation": "<2-3 kalimat Bahasa Indonesia: kenapa angka ini berdampak begitu ke emas>",
  "trading_note": "<1 kalimat saran praktis Bahasa Indonesia untuk trader gold>"
}

Logika: data USD lebih kuat dari forecast (BEAT) biasanya = USD menguat = emas BEARISH. Data lemah (MISS) = USD melemah = emas BULLISH. Untuk inflasi (CPI/PPI) tinggi = Fed hawkish = emas bearish. Untuk unemployment/jobless tinggi = ekonomi lemah = Fed dovish = emas bullish. Return ONLY JSON.`;

function extractJSON(text: string): any | null {
  if (!text) return null;
  const raw = text.trim().replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(raw.slice(s, e + 1)); } catch { return null; }
}

async function analyzeWithSearch(title: string, forecast: string, previous: string, date: string): Promise<any> {
  const messages: Anthropic.MessageParam[] = [{
    role: "user",
    content: `Event: ${title}
Tanggal rilis: ${date}
Forecast: ${forecast || "N/A"}
Previous: ${previous || "N/A"}

Cari angka ACTUAL hasil rilis event ini di web (kalau sudah rilis), lalu analisa dampaknya ke XAUUSD. Return ONLY JSON.`,
  }];

  for (let i = 0; i < MAX_ITER; i++) {
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: IMPACT_SYSTEM,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 } as any],
      messages,
    });

    const textBlocks = resp.content.filter((b: any) => b.type === "text") as any[];
    for (const b of textBlocks) {
      const parsed = extractJSON(b.text);
      if (parsed && parsed.gold_impact) return parsed;
    }

    if (resp.stop_reason === "end_turn") {
      const all = textBlocks.map((b) => b.text).join("\n");
      const parsed = extractJSON(all);
      if (parsed) return parsed;
      throw new Error("Analisa tidak valid");
    }

    if (resp.stop_reason === "pause_turn" || resp.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: resp.content });
      messages.push({ role: "user", content: "Lanjutkan dan keluarkan JSON analisa final." });
      continue;
    }
    break;
  }
  throw new Error("Gagal menganalisa setelah beberapa percobaan");
}

export async function POST(req: NextRequest) {
  const { isPro } = await getUserStatus(req);
  if (!isPro) {
    return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.event_key || !body?.title) {
    return NextResponse.json({ error: "Data event tidak lengkap" }, { status: 400 });
  }

  const { event_key, title, forecast, previous, date } = body;

  // ── Guard: hanya izinkan analisa untuk event HARI INI ──
  // Hemat biaya: event lama/kemarin tidak bisa di-generate.
  const eventMs = Date.parse(date);
  if (!Number.isNaN(eventMs)) {
    const now = new Date();
    const ev = new Date(eventMs);
    const sameDay =
      now.getUTCFullYear() === ev.getUTCFullYear() &&
      now.getUTCMonth() === ev.getUTCMonth() &&
      now.getUTCDate() === ev.getUTCDate();
    // Toleransi: anggap "hari ini" dalam window 24 jam ke belakang juga,
    // supaya event dini hari tetap bisa dianalisa di hari yang sama.
    const within24h = Math.abs(Date.now() - eventMs) < 24 * 60 * 60 * 1000;
    if (!sameDay && !within24h) {
      return NextResponse.json(
        { error: "Analisa impact hanya tersedia untuk event hari ini" },
        { status: 403 }
      );
    }
  }

  // 1. Cek cache impact per event
  const { data: cached } = await supabaseAdmin
    .from("calendar_impact")
    .select("impact_data")
    .eq("event_key", event_key)
    .maybeSingle();

  if (cached?.impact_data) {
    return NextResponse.json({ cached: true, data: cached.impact_data });
  }

  // 2. Generate analisa baru (dengan web search untuk cari actual)
  try {
    const parsed = await analyzeWithSearch(title, forecast, previous, date);

    // 3. Simpan cache HANYA kalau event sudah rilis (released true)
    // Kalau belum rilis, jangan cache — biar nanti bisa di-generate ulang setelah rilis
    if (parsed.released !== false) {
      await supabaseAdmin.from("calendar_impact").insert({
        event_key,
        impact_data: parsed,
      });
    }

    return NextResponse.json({ cached: false, data: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal analisa impact" }, { status: 500 });
  }
}
