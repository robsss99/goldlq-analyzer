// app/calendar/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const GOLD = "#D4AF37";
const BG = "#080A0E";
const BG_CARD = "#0F1520";
const BORDER = "#1E2A3A";
const GREEN = "#00C896";
const RED = "#FF4560";
const TEXT = "#E2E8F0";
const TEXT_DIM = "#64748B";
const TEXT_MID = "#94A3B8";

interface CalEvent {
  key: string;
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
  actual: string;
  released: boolean;
  gold_impact?: string | null;
}

interface ImpactData {
  released?: boolean;
  actual_found?: string;
  surprise: string;
  usd_reaction: string;
  gold_impact: string;
  magnitude: string;
  explanation: string;
  trading_note: string;
}

const IMPACT_COLOR: Record<string, string> = {
  BULLISH: GREEN, BEARISH: RED, NEUTRAL: GOLD,
  USD_STRONGER: RED, USD_WEAKER: GREEN,
  BEAT: GREEN, MISS: RED, INLINE: GOLD,
  HIGH: RED, MEDIUM: GOLD, LOW: TEXT_DIM,
};

export default function CalendarPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal impact
  const [selected, setSelected] = useState<CalEvent | null>(null);
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactError, setImpactError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch("/api/me");
        const me = await meRes.json();
        const pro = me?.status === "user" && me?.isActive === true && me?.isExpired === false;
        setIsPro(!!pro);
        if (pro) await loadCalendar();
      } catch {
        setIsPro(false);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    })();
  }, []);

  const loadCalendar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar", { method: "GET" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal ambil calendar");
      setEvents(json.events || []);
      setFetchedAt(json.fetched_at);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openImpact = async (ev: CalEvent) => {
    setSelected(ev);
    setImpact(null);
    setImpactError(null);
    if (!ev.released) return; // belum rilis, tidak ada analisa
    if (!isToday(ev.date)) return; // hanya event hari ini yang dianalisa (hemat biaya)
    setImpactLoading(true);
    try {
      const res = await fetch("/api/calendar/impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_key: ev.key, title: ev.title, actual: ev.actual,
          forecast: ev.forecast, previous: ev.previous, date: ev.date,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal analisa");
      setImpact(json.data);

      // Kalau web search menemukan angka actual + dampak, tulis ke kartu event
      // supaya '—' berubah jadi angka asli & badge dampak tampil (tetap ada setelah reload).
      if (json.data?.actual_found || json.data?.gold_impact) {
        setEvents((prev) =>
          prev.map((e) =>
            e.key === ev.key
              ? {
                  ...e,
                  actual: json.data.actual_found || e.actual,
                  gold_impact: json.data.gold_impact || e.gold_impact,
                }
              : e
          )
        );
      }
    } catch (e: any) {
      setImpactError(e.message);
    } finally {
      setImpactLoading(false);
    }
  };

  // Group events by day
  const grouped = events.reduce((acc: Record<string, CalEvent[]>, ev) => {
    const day = new Date(ev.date).toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long" });
    (acc[day] = acc[day] || []).push(ev);
    return acc;
  }, {});

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  // Cek apakah event terjadi hari ini (untuk izin klik analisa impact)
  const isToday = (iso: string) => {
    const ms = Date.parse(iso);
    if (Number.isNaN(ms)) return false;
    const now = new Date();
    const ev = new Date(ms);
    const sameDay =
      now.getFullYear() === ev.getFullYear() &&
      now.getMonth() === ev.getMonth() &&
      now.getDate() === ev.getDate();
    const within24h = Math.abs(Date.now() - ms) < 24 * 60 * 60 * 1000;
    return sameDay || within24h;
  };

  // Event bisa dianalisa kalau: sudah rilis DAN hari ini
  const canAnalyze = (ev: CalEvent) => ev.released && isToday(ev.date);

  // ── Loading auth ──
  if (!authChecked) {
    return <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: GOLD, fontFamily: "monospace", fontSize: "0.8rem" }}>Loading…</div>
    </div>;
  }

  // ── Paywall ──
  if (!isPro) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: BG_CARD, border: `1px solid ${GOLD}30`, borderRadius: 12, padding: "32px 24px", textAlign: "center", maxWidth: 380 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🔒</div>
          <div style={{ color: GOLD, fontSize: "1rem", fontWeight: 700, marginBottom: 8, fontFamily: "monospace" }}>Fitur Member</div>
          <div style={{ color: TEXT_MID, fontSize: "0.8rem", lineHeight: 1.6, marginBottom: 20 }}>
            Economic Calendar hanya untuk member aktif. Login atau aktivasi akun untuk akses jadwal news high-impact + analisa dampak ke XAUUSD.
          </div>
          <button onClick={() => router.push("/login")} style={{ background: `linear-gradient(135deg, ${GOLD}, #9A7D23)`, border: "none", borderRadius: 8, padding: "12px 28px", color: "#000", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "monospace" }}>LOGIN / AKTIVASI</button>
          <div style={{ marginTop: 16 }}>
            <button onClick={() => router.push("/")} style={{ background: "transparent", border: "none", color: TEXT_DIM, fontSize: "0.62rem", cursor: "pointer", fontFamily: "monospace" }}>← Kembali ke halaman utama</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "monospace", position: "relative" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .cal-grid-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(${BORDER}25 1px,transparent 1px),linear-gradient(90deg,${BORDER}25 1px,transparent 1px);
          background-size: 40px 40px; }
        .cal-container { position: relative; z-index: 2; width: 100%; max-width: 480px; margin: 0 auto; padding: 16px; animation: fadeUp .5s ease; }
        @media (min-width: 640px) { .cal-container { max-width: 640px; padding: 24px; } }
        @media (min-width: 1024px) { .cal-container { max-width: 760px; padding: 32px; } }
      `}</style>

      <div className="cal-grid-bg" />

      <div className="cal-container">

        {/* Header */}
        <button onClick={() => router.push("/")} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 14px", color: TEXT_DIM, fontSize: "0.6rem", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "monospace", marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 6 }}>← KEMBALI</button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.2rem" }}>📅</span>
              <span style={{ color: GOLD, fontSize: "1.05rem", fontWeight: 800, letterSpacing: "0.1em", textShadow: `0 0 20px ${GOLD}60` }}>ECONOMIC CALENDAR</span>
            </div>
            <div style={{ color: TEXT_DIM, fontSize: "0.55rem", letterSpacing: "0.2em", marginTop: 2 }}>USD HIGH-IMPACT · XAUUSD FOCUS</div>
          </div>
          <button onClick={loadCalendar} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 12px", color: TEXT_DIM, fontSize: "0.55rem", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "monospace" }}>↻ REFRESH</button>
        </div>

        <div style={{ marginTop: 10, height: 1, background: `linear-gradient(90deg,${GOLD}80,${GOLD}20,transparent)`, marginBottom: 16 }} />

        {fetchedAt && (
          <div style={{ color: TEXT_DIM, fontSize: "0.55rem", marginBottom: 12 }}>
            Data diperbarui: {new Date(fetchedAt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ width: 40, height: 40, margin: "0 auto 12px", borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: GOLD, animation: "spin 1s linear infinite" }} />
            <div style={{ color: TEXT_DIM, fontSize: "0.65rem" }}>Memuat calendar…</div>
          </div>
        )}

        {error && (
          <div style={{ background: `${RED}10`, border: `1px solid ${RED}30`, borderRadius: 8, padding: "12px 16px", fontSize: "0.7rem", color: RED }}>⚠️ {error}</div>
        )}

        {!loading && !error && events.length === 0 && (
          <div style={{ textAlign: "center", padding: 30, color: TEXT_DIM, fontSize: "0.7rem" }}>
            Tidak ada event USD high-impact minggu ini.
          </div>
        )}

        {/* Events grouped by day */}
        {!loading && Object.entries(grouped).map(([day, dayEvents]) => (
          <div key={day} style={{ marginBottom: 18 }}>
            <div style={{ color: GOLD, fontSize: "0.62rem", letterSpacing: "0.15em", marginBottom: 8, paddingLeft: 2 }}>{day.toUpperCase()}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dayEvents.map((ev) => {
                const clickable = canAnalyze(ev);
                return (
                <div key={ev.key} onClick={() => clickable && openImpact(ev)}
                  style={{ background: BG_CARD, border: `1px solid ${clickable ? GOLD + "30" : BORDER}`, borderRadius: 10, padding: "12px 14px", cursor: clickable ? "pointer" : "default" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: TEXT_DIM, fontSize: "0.6rem" }}>{fmtTime(ev.date)}</span>
                      <span style={{ background: `${RED}15`, color: RED, fontSize: "0.5rem", fontWeight: 700, padding: "2px 6px", borderRadius: 3, letterSpacing: "0.05em" }}>HIGH</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {/* Badge dampak ke XAUUSD (dari cache impact, kalau sudah pernah dianalisa) */}
                      {ev.gold_impact && (
                        <span style={{
                          background: `${IMPACT_COLOR[ev.gold_impact] || GOLD}15`,
                          color: IMPACT_COLOR[ev.gold_impact] || GOLD,
                          border: `1px solid ${IMPACT_COLOR[ev.gold_impact] || GOLD}40`,
                          fontSize: "0.5rem", fontWeight: 700, padding: "2px 7px", borderRadius: 3,
                          letterSpacing: "0.05em",
                        }}>
                          XAU {ev.gold_impact}
                        </span>
                      )}
                      {ev.released ? (
                        <span style={{ color: GREEN, fontSize: "0.5rem", letterSpacing: "0.1em" }}>● RELEASED</span>
                      ) : (
                        <span style={{ color: TEXT_DIM, fontSize: "0.5rem", letterSpacing: "0.1em" }}>○ UPCOMING</span>
                      )}
                    </div>
                  </div>
                  <div style={{ color: TEXT, fontSize: "0.78rem", fontWeight: 600, marginBottom: 8 }}>{ev.title}</div>
                  <div style={{ display: "flex", gap: 14 }}>
                    {[
                      { label: "ACTUAL", value: ev.actual || "—", highlight: ev.released },
                      { label: "FORECAST", value: ev.forecast || "—" },
                      { label: "PREVIOUS", value: ev.previous || "—" },
                    ].map(({ label, value, highlight }) => (
                      <div key={label}>
                        <div style={{ color: TEXT_DIM, fontSize: "0.5rem", letterSpacing: "0.1em" }}>{label}</div>
                        <div style={{ color: highlight ? GOLD : TEXT_MID, fontSize: "0.72rem", fontWeight: highlight ? 700 : 400 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {clickable && (
                    <div style={{ marginTop: 8, color: GOLD, fontSize: "0.55rem", letterSpacing: "0.05em" }}>
                      🔍 Tap untuk lihat dampak ke XAUUSD
                    </div>
                  )}
                  {ev.released && !isToday(ev.date) && (
                    <div style={{ marginTop: 8, color: TEXT_DIM, fontSize: "0.52rem", letterSpacing: "0.05em" }}>
                      Analisa dampak hanya untuk event hari ini
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${GOLD}30,transparent)`, marginBottom: 10 }} />
          <div style={{ color: TEXT_DIM, fontSize: "0.52rem", letterSpacing: "0.15em" }}>DATA: FOREX FACTORY · IMPACT BY CLAUDE AI</div>
          <div style={{ color: `${TEXT_DIM}70`, fontSize: "0.48rem", marginTop: 3 }}>Educational only. Not financial advice.</div>
        </div>
      </div>

      {/* Modal impact */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: BG_CARD, border: `1px solid ${GOLD}30`, borderRadius: 12, padding: 20, maxWidth: 420, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ color: TEXT, fontSize: "0.85rem", fontWeight: 700, flex: 1 }}>{selected.title}</div>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: TEXT_DIM, fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>

            {/* Angka */}
            <div style={{ display: "flex", gap: 14, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${BORDER}` }}>
              {[
                { label: "ACTUAL", value: selected.actual || "—", c: GOLD },
                { label: "FORECAST", value: selected.forecast || "—", c: TEXT_MID },
                { label: "PREVIOUS", value: selected.previous || "—", c: TEXT_MID },
              ].map(({ label, value, c }) => (
                <div key={label}>
                  <div style={{ color: TEXT_DIM, fontSize: "0.5rem", letterSpacing: "0.1em" }}>{label}</div>
                  <div style={{ color: c, fontSize: "0.9rem", fontWeight: 700 }}>{value}</div>
                </div>
              ))}
            </div>

            {!selected.released && (
              <div style={{ color: TEXT_DIM, fontSize: "0.72rem", textAlign: "center", padding: 20 }}>
                Event ini belum waktunya rilis. Analisa dampak tersedia setelah jadwal rilis lewat.
              </div>
            )}

            {selected.released && !isToday(selected.date) && (
              <div style={{ color: TEXT_DIM, fontSize: "0.72rem", textAlign: "center", padding: 20 }}>
                Analisa dampak hanya tersedia untuk event hari ini. Event ini sudah lewat.
              </div>
            )}

            {impactLoading && (
              <div style={{ textAlign: "center", padding: 24 }}>
                <div style={{ width: 36, height: 36, margin: "0 auto 10px", borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: GOLD, animation: "spin 1s linear infinite" }} />
                <div style={{ color: TEXT_DIM, fontSize: "0.62rem" }}>Mencari hasil aktual & menganalisa…</div>
                <div style={{ color: `${TEXT_DIM}90`, fontSize: "0.55rem", marginTop: 4 }}>~10-15 detik</div>
              </div>
            )}

            {impactError && (
              <div style={{ background: `${RED}10`, border: `1px solid ${RED}30`, borderRadius: 8, padding: "10px 14px", fontSize: "0.68rem", color: RED }}>⚠️ {impactError}</div>
            )}

            {impact && impact.released === false && (
              <div style={{ color: TEXT_DIM, fontSize: "0.7rem", textAlign: "center", padding: 16 }}>
                Hasil aktual belum tersedia di sumber berita. Coba lagi beberapa saat setelah rilis.
              </div>
            )}

            {impact && impact.released !== false && (
              <div>
                {/* Actual yang ditemukan dari web (kalau ada) */}
                {impact.actual_found && (
                  <div style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}30`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, textAlign: "center" }}>
                    <span style={{ color: TEXT_DIM, fontSize: "0.55rem", letterSpacing: "0.1em" }}>ACTUAL (dari berita): </span>
                    <span style={{ color: GOLD, fontSize: "0.85rem", fontWeight: 700 }}>{impact.actual_found}</span>
                  </div>
                )}
                {/* Badges */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {[
                    { label: impact.surprise, c: IMPACT_COLOR[impact.surprise] || GOLD },
                    { label: impact.usd_reaction.replace(/_/g, " "), c: IMPACT_COLOR[impact.usd_reaction] || GOLD },
                    { label: "GOLD " + impact.gold_impact, c: IMPACT_COLOR[impact.gold_impact] || GOLD },
                  ].map(({ label, c }, i) => (
                    <div key={i} style={{ background: `${c}15`, border: `1px solid ${c}40`, borderRadius: 5, padding: "5px 10px" }}>
                      <span style={{ color: c, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.05em" }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Gold impact besar */}
                <div style={{ background: `${IMPACT_COLOR[impact.gold_impact]}10`, border: `1px solid ${IMPACT_COLOR[impact.gold_impact]}30`, borderRadius: 8, padding: "12px 14px", marginBottom: 12, textAlign: "center" }}>
                  <div style={{ color: TEXT_DIM, fontSize: "0.55rem", letterSpacing: "0.15em", marginBottom: 4 }}>DAMPAK KE XAUUSD</div>
                  <div style={{ color: IMPACT_COLOR[impact.gold_impact], fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em", textShadow: `0 0 12px ${IMPACT_COLOR[impact.gold_impact]}50` }}>
                    {impact.gold_impact} {impact.magnitude === "HIGH" ? "🔥" : ""}
                  </div>
                </div>

                <div style={{ color: TEXT_MID, fontSize: "0.7rem", lineHeight: 1.6, marginBottom: 12 }}>{impact.explanation}</div>

                <div style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}20`, borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ color: GOLD, fontSize: "0.55rem", letterSpacing: "0.1em", marginBottom: 4 }}>💡 TRADING NOTE</div>
                  <div style={{ color: TEXT, fontSize: "0.68rem", lineHeight: 1.5 }}>{impact.trading_note}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
