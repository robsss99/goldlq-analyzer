// app/api/calendar/route.ts
// Fetch jadwal calendar dari Forex Factory weekly JSON, filter USD high-impact,
// cache 30 menit di Supabase (hormati rate limit FF: maks 2 download / 5 menit).

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 menit
const FF_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";

// Event high-impact USD yang kita pedulikan (untuk gold)
// FF kasih field "impact": "High" | "Medium" | "Low" | "Holiday"
// Kita ambil semua USD High, plus beberapa keyword penting.
const KEY_EVENTS = [
  "Non-Farm", "NFP", "CPI", "PPI", "FOMC", "Federal Funds", "Interest Rate",
  "Unemployment", "Jobless", "GDP", "Powell", "Fed Chair", "Core PCE", "PCE",
  "Retail Sales", "ISM",
];

// ── Auth: Pro only (login + aktif + belum expired) ──
async function getUserStatus(req: NextRequest): Promise<{ isPro: boolean }> {
  const username = req.cookies.get("goldlq_session")?.value;
  if (!username) return { isPro: false };
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("is_active, expires_at")
    .eq("username", username)
    .maybeSingle();
  if (error || !data) return { isPro: false };
  const notExpired = new Date(data.expires_at) > new Date();
  return { isPro: data.is_active === true && notExpired };
}

interface FFEvent {
  title: string;
  country: string;
  date: string;     // ISO string
  impact: string;   // "High" | "Medium" | "Low" | "Holiday"
  forecast: string;
  previous: string;
  actual?: string;  // ada setelah rilis
}

// Buat key unik per event untuk cache impact
function eventKey(e: FFEvent): string {
  const t = e.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
  return `${e.country}_${t}_${e.date}`;
}

async function fetchAndFilterCalendar(): Promise<any[]> {
  const res = await fetch(FF_URL, {
    headers: { "User-Agent": "GoldLQ-Analyzer/1.0" },
    // jangan cache di fetch-level, kita handle cache sendiri di Supabase
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Forex Factory fetch gagal: ${res.status}`);

  const text = await res.text();
  // FF kadang balikin halaman "Request Denied" kalau kena rate limit
  if (text.trim().startsWith("<")) {
    throw new Error("Rate limit Forex Factory — coba lagi nanti");
  }

  let all: FFEvent[];
  try {
    all = JSON.parse(text);
  } catch {
    throw new Error("Format data calendar tidak valid");
  }

  // Filter: USD + (High impact ATAU termasuk key events)
  const nowMs = Date.now();
  const filtered = all
    .filter((e) => e.country === "USD")
    .filter((e) => {
      const isHigh = e.impact === "High";
      const isKey = KEY_EVENTS.some((k) => e.title.toLowerCase().includes(k.toLowerCase()));
      return isHigh || isKey;
    })
    .map((e) => {
      // Parse waktu event ke timestamp absolut (epoch ms).
      // FF kasih format ISO dengan offset, contoh "2026-06-10T08:30:00-04:00".
      // Date.parse menangani offset ini dengan benar → epoch UTC.
      const eventMs = Date.parse(e.date);
      const validTime = !Number.isNaN(eventMs);
      // "released" = waktu event sudah lewat (dengan toleransi 0).
      // Kalau gagal parse waktu, fallback ke cek field actual.
      const isPast = validTime
        ? eventMs < nowMs
        : !!(e.actual && e.actual.trim() !== "");

      return {
        key: eventKey(e),
        title: e.title,
        country: e.country,
        date: e.date,
        impact: e.impact,
        forecast: e.forecast || "",
        previous: e.previous || "",
        actual: e.actual || "",
        released: isPast,
      };
    });

  return filtered;
}

// Gabungkan data dari calendar_impact (actual + gold_impact) yang sudah
// ditemukan sebelumnya ke event yang sesuai, supaya tampil di kartu tanpa klik ulang.
async function mergeCachedActuals(events: any[]): Promise<any[]> {
  try {
    const keys = events.map((e) => e.key);
    if (keys.length === 0) return events;

    const { data: impacts } = await supabaseAdmin
      .from("calendar_impact")
      .select("event_key, impact_data")
      .in("event_key", keys);

    if (!impacts || impacts.length === 0) return events;

    const dataMap = new Map<string, { actual?: string; gold_impact?: string }>();
    for (const row of impacts) {
      const found = row.impact_data?.actual_found;
      const impact = row.impact_data?.gold_impact;
      dataMap.set(row.event_key, {
        actual: found && String(found).trim() !== "" ? String(found) : undefined,
        gold_impact: impact || undefined,
      });
    }

    return events.map((e) => {
      const cached = dataMap.get(e.key);
      if (!cached) return e;
      return {
        ...e,
        actual: cached.actual ?? e.actual,
        gold_impact: cached.gold_impact ?? null,
      };
    });
  } catch {
    return events; // gagal-aman
  }
}

// ── GET: ambil calendar (pakai cache 30 menit) ──
export async function GET(req: NextRequest) {
  const { isPro } = await getUserStatus(req);
  if (!isPro) {
    return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
  }

  // Cek cache
  const { data: cached } = await supabaseAdmin
    .from("calendar_cache")
    .select("events, fetched_at")
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cached) {
    const ageMs = Date.now() - new Date(cached.fetched_at).getTime();
    if (ageMs < CACHE_TTL_MS) {
      // Merge actual terbaru dari calendar_impact (bisa berubah sejak cache dibuat)
      const merged = await mergeCachedActuals(cached.events);
      return NextResponse.json({ cached: true, fetched_at: cached.fetched_at, events: merged });
    }
  }

  // Cache stale / kosong → fetch FF
  try {
    let events = await fetchAndFilterCalendar();
    events = await mergeCachedActuals(events);
    // Simpan cache
    await supabaseAdmin.from("calendar_cache").insert({ events });
    return NextResponse.json({ cached: false, fetched_at: new Date().toISOString(), events });
  } catch (e: any) {
    // Kalau fetch gagal tapi ada cache lama, pakai cache lama
    if (cached) {
      return NextResponse.json({
        cached: true, fetched_at: cached.fetched_at, events: cached.events,
        warning: "Pakai data lama: " + e.message,
      });
    }
    return NextResponse.json({ error: e.message || "Gagal ambil calendar" }, { status: 500 });
  }
}
