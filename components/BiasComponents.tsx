// components/BiasComponents.tsx
"use client";

import { useState } from "react";

// ── Design tokens ───────────────────────────────────────
const GOLD = "#D4AF37";
const BG_CARD = "#0F1520";
const BORDER = "#1E2A3A";
const GREEN = "#00C896";
const RED = "#FF4560";
const TEXT = "#E2E8F0";
const TEXT_DIM = "#64748B";
const TEXT_MID = "#94A3B8";

// ── Types ───────────────────────────────────────────────
export type BiasValue =
  | "BULLISH"
  | "BEARISH"
  | "NEUTRAL"
  | "SLIGHTLY_BULLISH"
  | "SLIGHTLY_BEARISH";

export interface BiasCluster {
  theme: string;
  explanation: string;
  headlines: string[];
}

export interface BiasData {
  bias: BiasValue;
  swing_bias: BiasValue;
  confidence: number;
  headline: string;
  summary: string;
  supports_bias: BiasCluster[];
  flips_bias: BiasCluster[];
  key_levels: { target: string; pullback: string; invalidation: string };
  safe_haven_demand: "HIGH" | "MODERATE" | "LOW";
  usd_pressure: "BULLISH_USD" | "NEUTRAL_USD" | "BEARISH_USD";
  fed_stance:
    | "HAWKISH"
    | "NEUTRAL_HAWKISH"
    | "NEUTRAL"
    | "NEUTRAL_DOVISH"
    | "DOVISH";
}

const COLOR_MAP: Record<string, string> = {
  HIGH: GREEN,
  MODERATE: GOLD,
  LOW: RED,
  BULLISH_USD: GREEN,
  NEUTRAL_USD: GOLD,
  BEARISH_USD: RED,
  HAWKISH: RED,
  NEUTRAL_HAWKISH: "#FF8A7A",
  NEUTRAL: GOLD,
  NEUTRAL_DOVISH: "#7FFFB2",
  DOVISH: GREEN,
  BULLISH: GREEN,
  BEARISH: RED,
  SLIGHTLY_BULLISH: "#7FFFB2",
  SLIGHTLY_BEARISH: "#FF8A7A",
};

// ── Direction Gauge + Confidence Bar (terpisah, anti-ambigu) ──
export function BiasGauge({
  bias,
  confidence,
}: {
  bias: BiasValue;
  confidence: number;
}) {
  const cfg = {
    BULLISH: { label: "BULLISH", color: GREEN, pos: 5 }, // pos: 0=full bear, 6=full bull
    SLIGHTLY_BULLISH: { label: "SLIGHTLY BULLISH", color: "#7FFFB2", pos: 4 },
    NEUTRAL: { label: "NEUTRAL", color: GOLD, pos: 3 },
    SLIGHTLY_BEARISH: { label: "SLIGHTLY BEARISH", color: "#FF8A7A", pos: 2 },
    BEARISH: { label: "BEARISH", color: RED, pos: 1 },
  }[bias] || { label: "NEUTRAL", color: GOLD, pos: 3 };

  // ── Direction gauge: 7 segmen dari BEAR (kiri) ke BULL (kanan) ──
  // Segmen yang aktif = posisi bias. Jarum menunjuk ke segmen itu.
  const SEG = 7; // 0..6
  const R = 78,
    cx = 110,
    cy = 105;
  // Sudut: segmen 0 di 180° (kiri), segmen 6 di 0° (kanan)
  const segAngle = (i: number) => 180 - (i * 180) / (SEG - 1);
  const activeAngle = segAngle(cfg.pos);
  const needleRad = (activeAngle * Math.PI) / 180;
  const nx = cx + 58 * Math.cos(needleRad);
  const ny = cy - 58 * Math.sin(needleRad);

  // Warna gradient per segmen: merah (bear) → kuning (neutral) → hijau (bull)
  const segColors = [
    "#FF4560",
    "#FF6B5A",
    "#FF8A7A",
    "#D4AF37",
    "#9FE88D",
    "#5FE89D",
    "#00C896",
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        width: "100%",
      }}
    >
      {/* ── GAUGE ARAH ── */}
      <div style={{ position: "relative", width: 220, height: 128 }}>
        <svg width="220" height="128" viewBox="0 0 220 128">
          {/* Segmen arc */}
          {Array.from({ length: SEG }).map((_, i) => {
            const a1 = ((segAngle(i) + 12) * Math.PI) / 180;
            const a2 = ((segAngle(i) - 12) * Math.PI) / 180;
            const isActive = i === cfg.pos;
            const x1 = cx + R * Math.cos(a1),
              y1 = cy - R * Math.sin(a1);
            const x2 = cx + R * Math.cos(a2),
              y2 = cy - R * Math.sin(a2);
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={isActive ? segColors[i] : BORDER}
                strokeWidth={isActive ? 14 : 9}
                strokeLinecap="round"
                style={
                  isActive
                    ? { filter: `drop-shadow(0 0 8px ${segColors[i]})` }
                    : { opacity: 0.5 }
                }
              />
            );
          })}
          {/* Jarum menunjuk segmen aktif */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke={cfg.color}
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 5px ${cfg.color})`,
              transition: "all 1s ease",
            }}
          />
          <circle
            cx={cx}
            cy={cy}
            r="6"
            fill={cfg.color}
            style={{ filter: `drop-shadow(0 0 6px ${cfg.color})` }}
          />
          {/* Label ujung */}
          <text
            x="8"
            y="120"
            fill={RED}
            fontSize="9"
            fontFamily="monospace"
            fontWeight="700"
            opacity="0.7"
          >
            BEAR
          </text>
          <text
            x="186"
            y="120"
            fill={GREEN}
            fontSize="9"
            fontFamily="monospace"
            fontWeight="700"
            opacity="0.7"
          >
            BULL
          </text>
        </svg>
        {/* Label arah di tengah bawah gauge */}
        <div
          style={{
            position: "absolute",
            bottom: 2,
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              fontSize: "0.5rem",
              color: TEXT_DIM,
              letterSpacing: "0.2em",
            }}
          >
            ARAH BIAS
          </div>
        </div>
      </div>

      {/* Label bias besar */}
      <div
        style={{
          background: `${cfg.color}15`,
          border: `1px solid ${cfg.color}40`,
          borderRadius: 6,
          padding: "8px 22px",
        }}
      >
        <span
          style={{
            color: cfg.color,
            fontSize: "0.9rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textShadow: `0 0 12px ${cfg.color}60`,
            fontFamily: "monospace",
          }}
        >
          {cfg.label}
        </span>
      </div>

      {/* ── BAR CONFIDENCE (terpisah) ── */}
      <div style={{ width: "100%", maxWidth: 280 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: "0.55rem",
              color: TEXT_DIM,
              letterSpacing: "0.15em",
              fontFamily: "monospace",
            }}
          >
            CONFIDENCE
          </span>
          <span
            style={{
              fontSize: "0.95rem",
              fontWeight: 800,
              color: cfg.color,
              fontFamily: "monospace",
              textShadow: `0 0 10px ${cfg.color}60`,
            }}
          >
            {confidence}%
          </span>
        </div>
        {/* Track */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 10,
            background: BORDER,
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          {/* Fill */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${Math.min(100, Math.max(0, confidence))}%`,
              background: `linear-gradient(90deg, ${cfg.color}99, ${cfg.color})`,
              borderRadius: 5,
              boxShadow: `0 0 10px ${cfg.color}80`,
              transition: "width 1.2s ease",
            }}
          />
        </div>
        {/* Skala referensi */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: "0.48rem", color: TEXT_DIM }}>Lemah</span>
          <span style={{ fontSize: "0.48rem", color: TEXT_DIM }}>Kuat</span>
        </div>
      </div>
    </div>
  );
}

// ── Metric Pill ─────────────────────────────────────────
export function MetricPill({ label, value }: { label: string; value: string }) {
  const shorts: Record<string, string> = {
    BULLISH_USD: "USD BULLISH",
    NEUTRAL_USD: "USD NEUTRAL",
    BEARISH_USD: "USD BEARISH",
    NEUTRAL_HAWKISH: "NEUTRAL-HAWKISH",
    NEUTRAL_DOVISH: "NEUTRAL-DOVISH",
    SLIGHTLY_BULLISH: "SLIGHTLY BULLISH",
    SLIGHTLY_BEARISH: "SLIGHTLY BEARISH",
  };
  const c = COLOR_MAP[value] || GOLD;
  const v = shorts[value] || value;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontSize: "0.52rem",
          color: TEXT_DIM,
          letterSpacing: "0.15em",
          fontFamily: "monospace",
        }}
      >
        {label}
      </div>
      <div
        style={{
          background: `${c}12`,
          border: `1px solid ${c}35`,
          borderRadius: 4,
          padding: "5px 6px",
        }}
      >
        <span
          style={{
            color: c,
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            fontFamily: "monospace",
            textShadow: `0 0 8px ${c}50`,
          }}
        >
          {v}
        </span>
      </div>
    </div>
  );
}

// ── Cluster list ────────────────────────────────────────
export function ClusterList({
  items,
  type,
}: {
  items: BiasCluster[];
  type: "support" | "flip";
}) {
  const [open, setOpen] = useState<number | null>(null);
  const color = type === "support" ? GREEN : RED;
  const label = type === "support" ? "▲ SUPPORTS BIAS" : "▼ COULD FLIP";
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
        <span
          style={{
            fontSize: "0.58rem",
            color: TEXT_DIM,
            letterSpacing: "0.2em",
            fontFamily: "monospace",
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              background: `${color}08`,
              border: `1px solid ${color}25`,
              borderRadius: 8,
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    marginBottom: 3,
                    fontFamily: "monospace",
                  }}
                >
                  {item.theme}
                </div>
                <div
                  style={{
                    color: TEXT_MID,
                    fontSize: "0.66rem",
                    lineHeight: 1.5,
                  }}
                >
                  {item.explanation}
                </div>
              </div>
              <span
                style={{ color: TEXT_DIM, fontSize: "0.65rem", marginLeft: 8 }}
              >
                {open === i ? "▲" : "▼"}
              </span>
            </div>
            {open === i && (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {item.headlines.map((h, j) => (
                  <div
                    key={j}
                    style={{
                      background: `${color}10`,
                      borderLeft: `2px solid ${color}60`,
                      padding: "5px 8px",
                      borderRadius: "0 4px 4px 0",
                    }}
                  >
                    <span
                      style={{
                        color: TEXT_MID,
                        fontSize: "0.6rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {h}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export {
  GOLD,
  BG_CARD,
  BORDER,
  GREEN,
  RED,
  TEXT,
  TEXT_DIM,
  TEXT_MID,
  COLOR_MAP,
};
