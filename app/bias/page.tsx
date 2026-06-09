// app/bias/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BiasGauge,
  MetricPill,
  ClusterList,
  GOLD,
  BG_CARD,
  BORDER,
  GREEN,
  RED,
  TEXT,
  TEXT_DIM,
  TEXT_MID,
  COLOR_MAP,
  type BiasData,
} from "@/components/BiasComponents";

const BG = "#080A0E";

// Simpan waktu generate terakhir per-user di localStorage (UX personal)
const LAST_GEN_KEY = "goldlq_bias_last_gen";

export default function BiasPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [data, setData] = useState<BiasData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [lastUserGen, setLastUserGen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"bias" | "levels" | "context">("bias");
  const [fromCache, setFromCache] = useState(false);

  // ── Cek status Pro via /api/me ──
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me");
        const me = await res.json();
        const pro =
          me?.status === "user" &&
          me?.isActive === true &&
          me?.isExpired === false;
        setIsPro(!!pro);
        if (me?.username) setUsername(me.username);
        if (pro) {
          loadCached();
          // Ambil waktu generate terakhir user dari localStorage
          try {
            const stored = localStorage.getItem(LAST_GEN_KEY);
            if (stored) setLastUserGen(stored);
          } catch {}
        }
      } catch {
        setIsPro(false);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  const loadCached = async () => {
    try {
      const res = await fetch("/api/bias", { method: "GET" });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.data) {
        setData(json.data);
        setGeneratedAt(json.generated_at);
        setFromCache(true);
      }
    } catch {}
  };

  // ── Generate (shared cache di backend, tapi terasa personal) ──
  const generate = async () => {
    setLoading(true);
    setError(null);
    // Selalu tampilkan animasi minimal 1.2s biar terasa "generate sendiri"
    // walau backend balikin cache instan.
    const startTime = Date.now();
    try {
      const res = await fetch("/api/bias", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal generate bias");

      // Pastikan animasi tampil minimal 1.2 detik
      const elapsed = Date.now() - startTime;
      if (elapsed < 1200)
        await new Promise((r) => setTimeout(r, 1200 - elapsed));

      setData(json.data);
      setGeneratedAt(json.generated_at);
      setFromCache(json.cached === true);

      // Catat waktu user generate (personal)
      const now = new Date().toISOString();
      setLastUserGen(now);
      try {
        localStorage.setItem(LAST_GEN_KEY, now);
      } catch {}
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ── Loading auth ──
  if (!authChecked) {
    return (
      <div
        style={{
          background: BG,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{ color: GOLD, fontFamily: "monospace", fontSize: "0.8rem" }}
        >
          Loading…
        </div>
      </div>
    );
  }

  // ── Paywall ──
  if (!isPro) {
    return (
      <div
        style={{
          background: BG,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            background: BG_CARD,
            border: `1px solid ${GOLD}30`,
            borderRadius: 12,
            padding: "32px 24px",
            textAlign: "center",
            maxWidth: 380,
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🔒</div>
          <div
            style={{
              color: GOLD,
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: 8,
              fontFamily: "monospace",
            }}
          >
            Fitur Member
          </div>
          <div
            style={{
              color: TEXT_MID,
              fontSize: "0.8rem",
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            XAUUSD Daily Bias hanya tersedia untuk member aktif. Login atau
            aktivasi akun untuk akses analisa fundamental harian berbasis AI.
          </div>
          <button
            onClick={() => router.push("/login")}
            style={{
              background: `linear-gradient(135deg, ${GOLD}, #9A7D23)`,
              border: "none",
              borderRadius: 8,
              padding: "12px 28px",
              color: "#000",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            LOGIN / AKTIVASI
          </button>
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => router.push("/")}
              style={{
                background: "transparent",
                border: "none",
                color: TEXT_DIM,
                fontSize: "0.62rem",
                letterSpacing: "0.1em",
                cursor: "pointer",
                fontFamily: "monospace",
              }}
            >
              ← Kembali ke halaman utama
            </button>
          </div>
        </div>
      </div>
    );
  }

  const biasColor = data ? COLOR_MAP[data.bias] || GOLD : GOLD;

  return (
    <div
      style={{
        background: BG,
        minHeight: "100vh",
        color: TEXT,
        fontFamily: "monospace",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(2.2);opacity:0} }
        .bias-grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(${BORDER}25 1px,transparent 1px),linear-gradient(90deg,${BORDER}25 1px,transparent 1px);
          background-size: 40px 40px;
        }
        /* Responsive container */
        .bias-container {
          position: relative; z-index: 2;
          width: 100%; max-width: 480px;
          margin: 0 auto; padding: 16px;
          animation: fadeUp .5s ease;
        }
        /* Tablet */
        @media (min-width: 640px) {
          .bias-container { max-width: 600px; padding: 24px; }
          .bias-headline { font-size: 0.95rem !important; }
        }
        /* Desktop — 1 kolom tengah, lebih lebar & lega */
        @media (min-width: 1024px) {
          .bias-container { max-width: 720px; padding: 32px; }
          .bias-main-card { padding: 28px !important; }
          .bias-headline { font-size: 1.05rem !important; }
          .bias-tab-btn { font-size: 0.65rem !important; padding: 10px 4px !important; }
          .bias-cluster-wrap { padding: 20px !important; }
        }
        /* Large desktop — kasih sedikit ruang lebih, tetap 1 kolom */
        @media (min-width: 1440px) {
          .bias-container { max-width: 800px; }
        }
        .bias-tabrow { display: flex; gap: 4px; margin-bottom: 10px; }
        .bias-metric-row { display: flex; gap: 6px; }
        @media (min-width: 640px) {
          .bias-metric-row { gap: 10px; }
        }
      `}</style>

      <div className="bias-grid-bg" />

      <div className="bias-container">
        {/* Header + greeting personal */}
        <div style={{ marginBottom: 18 }}>
          {/* Tombol kembali ke halaman utama */}
          <button
            onClick={() => router.push("/")}
            style={{
              background: "transparent",
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              padding: "6px 14px",
              color: TEXT_DIM,
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              cursor: "pointer",
              fontFamily: "monospace",
              marginBottom: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← KEMBALI
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1.2rem" }}>⚡</span>
                <span
                  style={{
                    color: GOLD,
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textShadow: `0 0 20px ${GOLD}60`,
                  }}
                >
                  XAUUSD BIAS
                </span>
              </div>
              <div
                style={{
                  color: TEXT_DIM,
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  marginTop: 2,
                }}
              >
                DAILY FUNDAMENTAL ANALYZER
              </div>
            </div>
            {generatedAt && (
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    color: TEXT_DIM,
                    fontSize: "0.52rem",
                    marginBottom: 4,
                  }}
                >
                  {formatTime(generatedAt)}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    justifyContent: "flex-end",
                  }}
                >
                  <div style={{ position: "relative", width: 7, height: 7 }}>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        background: fromCache ? GOLD : GREEN,
                        opacity: 0.4,
                        animation: "ping 1.5s ease-in-out infinite",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 1,
                        borderRadius: "50%",
                        background: fromCache ? GOLD : GREEN,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      color: fromCache ? GOLD : GREEN,
                      fontSize: "0.52rem",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {fromCache ? "CACHED" : "FRESH"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Greeting personal */}
          {username && (
            <div
              style={{
                marginTop: 12,
                background: `${GOLD}08`,
                border: `1px solid ${GOLD}18`,
                borderRadius: 8,
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              <div style={{ color: TEXT, fontSize: "0.72rem" }}>
                👋 Halo,{" "}
                <span style={{ color: GOLD, fontWeight: 700 }}>{username}</span>
              </div>
              {lastUserGen && (
                <div style={{ color: TEXT_DIM, fontSize: "0.58rem" }}>
                  Terakhir kamu generate: {formatTime(lastUserGen)}
                </div>
              )}
            </div>
          )}

          <div
            style={{
              marginTop: 12,
              height: 1,
              background: `linear-gradient(90deg,${GOLD}80,${GOLD}20,transparent)`,
            }}
          />
        </div>

        {/* Generate CTA */}
        {!data && !loading && (
          <div
            className="bias-main-card"
            style={{
              background: BG_CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: "32px 20px",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🏆</div>
            <div
              style={{
                color: GOLD,
                fontSize: "0.9rem",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              XAUUSD Daily Bias
            </div>
            <div
              style={{
                color: TEXT_MID,
                fontSize: "0.72rem",
                lineHeight: 1.6,
                marginBottom: 20,
                maxWidth: 320,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              AI scan berita geopolitik, Fed signals, USD flows & safe-haven
              demand untuk generate bias gold hari ini.
            </div>
            <button
              onClick={generate}
              style={{
                background: `linear-gradient(135deg, ${GOLD}, #9A7D23)`,
                border: "none",
                borderRadius: 8,
                padding: "12px 28px",
                color: "#000",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                cursor: "pointer",
                fontFamily: "monospace",
                boxShadow: `0 0 20px ${GOLD}40`,
              }}
            >
              ⚡ GENERATE BIAS
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            className="bias-main-card"
            style={{
              background: BG_CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: "40px 20px",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                margin: "0 auto 16px",
                borderRadius: "50%",
                border: `3px solid ${BORDER}`,
                borderTopColor: GOLD,
                animation: "spin 1s linear infinite",
              }}
            />
            <div
              style={{
                color: GOLD,
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
              }}
            >
              AI ANALYZING MARKET…
            </div>
            <div style={{ color: TEXT_DIM, fontSize: "0.6rem", marginTop: 8 }}>
              Scanning news, Fed, geopolitics
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              background: `${RED}10`,
              border: `1px solid ${RED}30`,
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 12,
              fontSize: "0.7rem",
              color: RED,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Data */}
        {data && !loading && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div
              className="bias-main-card"
              style={{
                background: BG_CARD,
                border: `1px solid ${biasColor}30`,
                borderRadius: 12,
                padding: 18,
                marginBottom: 10,
                boxShadow: `0 0 30px ${biasColor}08`,
              }}
            >
              <div
                className="bias-headline"
                style={{
                  color: TEXT,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  lineHeight: 1.5,
                  marginBottom: 14,
                  fontFamily: "Georgia,serif",
                  fontStyle: "italic",
                  borderLeft: `3px solid ${GOLD}`,
                  paddingLeft: 10,
                }}
              >
                "{data.headline}"
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <BiasGauge bias={data.bias} confidence={data.confidence} />
              </div>
              <div className="bias-metric-row" style={{ marginBottom: 8 }}>
                <MetricPill label="SAFE HAVEN" value={data.safe_haven_demand} />
                <MetricPill label="USD" value={data.usd_pressure} />
                <MetricPill label="FED" value={data.fed_stance} />
              </div>
              <div className="bias-metric-row">
                <MetricPill label="SWING BIAS" value={data.swing_bias} />
                <MetricPill label="DAY BIAS" value={data.bias} />
              </div>
            </div>

            {/* Tabs */}
            <div className="bias-tabrow">
              {(
                [
                  ["bias", "CLUSTERS"],
                  ["levels", "KEY LEVELS"],
                  ["context", "CONTEXT"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  className="bias-tab-btn"
                  onClick={() => setTab(key)}
                  style={{
                    flex: 1,
                    padding: "7px 4px",
                    background: tab === key ? `${GOLD}18` : "transparent",
                    border: `1px solid ${tab === key ? GOLD + "50" : BORDER}`,
                    borderRadius: 6,
                    color: tab === key ? GOLD : TEXT_DIM,
                    fontSize: "0.55rem",
                    letterSpacing: "0.12em",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontWeight: tab === key ? 700 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "bias" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div
                  className="bias-cluster-wrap"
                  style={{
                    background: BG_CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <ClusterList items={data.supports_bias} type="support" />
                </div>
                <div
                  className="bias-cluster-wrap"
                  style={{
                    background: BG_CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <ClusterList items={data.flips_bias} type="flip" />
                </div>
              </div>
            )}

            {tab === "levels" && (
              <div
                className="bias-cluster-wrap"
                style={{
                  background: BG_CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    color: GOLD,
                    fontSize: "0.58rem",
                    letterSpacing: "0.2em",
                    marginBottom: 12,
                  }}
                >
                  KEY PRICE LEVELS
                </div>
                {[
                  {
                    label: "TARGET",
                    value: data.key_levels.target,
                    color: ["BEARISH", "SLIGHTLY_BEARISH"].includes(data.bias)
                      ? RED
                      : GREEN,
                  },
                  {
                    label: "PULLBACK / RESISTANCE",
                    value: data.key_levels.pullback,
                    color: GOLD,
                  },
                  {
                    label: "INVALIDATION",
                    value: data.key_levels.invalidation,
                    color: "#FF8A7A",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: `${color}08`,
                      border: `1px solid ${color}20`,
                      borderRadius: 6,
                      padding: "10px 12px",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ color: TEXT_DIM, fontSize: "0.6rem" }}>
                      {label}
                    </span>
                    <span
                      style={{
                        color,
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        textShadow: `0 0 10px ${color}50`,
                      }}
                    >
                      ${value}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 12,
                    background: `${GOLD}08`,
                    border: `1px solid ${GOLD}20`,
                    borderRadius: 6,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      color: TEXT_DIM,
                      fontSize: "0.58rem",
                      marginBottom: 5,
                      letterSpacing: "0.1em",
                    }}
                  >
                    MACRO SUMMARY
                  </div>
                  <div
                    style={{
                      color: TEXT_MID,
                      fontSize: "0.67rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {data.summary}
                  </div>
                </div>
              </div>
            )}

            {tab === "context" && (
              <div
                className="bias-cluster-wrap"
                style={{
                  background: BG_CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    color: GOLD,
                    fontSize: "0.58rem",
                    letterSpacing: "0.2em",
                    marginBottom: 12,
                  }}
                >
                  FUNDAMENTAL CONTEXT
                </div>
                {[
                  {
                    label: "Safe-Haven Demand",
                    value: data.safe_haven_demand,
                    desc: "Demand emas sebagai aset defensif",
                  },
                  {
                    label: "USD Pressure",
                    value: data.usd_pressure,
                    desc: "Hubungan inverse dolar vs emas",
                  },
                  {
                    label: "Fed Policy Stance",
                    value: data.fed_stance,
                    desc: "Arah kebijakan FOMC saat ini",
                  },
                  {
                    label: "Swing Bias",
                    value: data.swing_bias,
                    desc: "Bias arah multi-hari",
                  },
                  {
                    label: "Day Trading Bias",
                    value: data.bias,
                    desc: "Bias intraday",
                  },
                ].map(({ label, value, desc }) => {
                  const c = COLOR_MAP[value] || GOLD;
                  return (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: `1px solid ${BORDER}`,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: TEXT,
                            fontSize: "0.7rem",
                            marginBottom: 2,
                          }}
                        >
                          {label}
                        </div>
                        <div style={{ color: TEXT_DIM, fontSize: "0.58rem" }}>
                          {desc}
                        </div>
                      </div>
                      <div
                        style={{
                          color: c,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textShadow: `0 0 8px ${c}50`,
                          textAlign: "right",
                          maxWidth: 130,
                        }}
                      >
                        {value.replace(/_/g, " ")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div
              style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                onClick={generate}
                style={{
                  background: "transparent",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  padding: "8px 20px",
                  color: TEXT_DIM,
                  fontSize: "0.6rem",
                  letterSpacing: "0.15em",
                  cursor: "pointer",
                  fontFamily: "monospace",
                }}
              >
                ↻ GENERATE ULANG
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg,transparent,${GOLD}30,transparent)`,
              marginBottom: 10,
            }}
          />
          <div
            style={{
              color: TEXT_DIM,
              fontSize: "0.52rem",
              letterSpacing: "0.15em",
            }}
          >
            POWERED BY CLAUDE AI · @360TRADERSSS
          </div>
          <div
            style={{
              color: `${TEXT_DIM}70`,
              fontSize: "0.48rem",
              marginTop: 3,
            }}
          >
            Educational only. Not financial advice.
          </div>
        </div>
      </div>
    </div>
  );
}
