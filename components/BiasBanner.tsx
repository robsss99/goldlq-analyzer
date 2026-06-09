// components/BiasBanner.tsx
// Banner ringkas untuk halaman utama GoldLQ.
// - User aktif: tampil bias + confidence + tombol "Lihat Detail" → /bias
// - Trial/belum login: tampil preview blur + ajakan upgrade
// Self-contained: cukup <BiasBanner /> di halaman utama.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const GOLD = "#D4AF37";
const BG_CARD = "#0F1520";
const BORDER = "#1E2A3A";
const GREEN = "#00C896";
const RED = "#FF4560";
const TEXT = "#E2E8F0";
const TEXT_DIM = "#64748B";
const TEXT_MID = "#94A3B8";

const COLOR_MAP: Record<string, string> = {
  BULLISH: GREEN,
  BEARISH: RED,
  NEUTRAL: GOLD,
  SLIGHTLY_BULLISH: "#7FFFB2",
  SLIGHTLY_BEARISH: "#FF8A7A",
};
const LABEL_MAP: Record<string, string> = {
  BULLISH: "BULLISH",
  BEARISH: "BEARISH",
  NEUTRAL: "NEUTRAL",
  SLIGHTLY_BULLISH: "SLIGHTLY BULLISH",
  SLIGHTLY_BEARISH: "SLIGHTLY BEARISH",
};

interface MiniBias {
  bias: string;
  confidence: number;
  headline: string;
}

export default function BiasBanner() {
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);
  const [checked, setChecked] = useState(false);
  const [data, setData] = useState<MiniBias | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch("/api/me");
        const me = await meRes.json();
        const pro =
          me?.status === "user" &&
          me?.isActive === true &&
          me?.isExpired === false;
        setIsPro(!!pro);

        if (pro) {
          // Ambil bias dari cache (GET = tidak trigger generate / API call)
          const bRes = await fetch("/api/bias", { method: "GET" });
          if (bRes.ok) {
            const json = await bRes.json();
            if (json?.data) {
              setData({
                bias: json.data.bias,
                confidence: json.data.confidence,
                headline: json.data.headline,
              });
              setGeneratedAt(json.generated_at);
            }
          }
        }
      } catch {
        // diam saja — banner tidak tampil kalau error
      } finally {
        setChecked(true);
      }
    })();
  }, []);

  if (!checked) return null;

  // ── PREVIEW untuk trial / belum login ──
  if (!isPro) {
    return (
      <div
        onClick={() => router.push("/login")}
        style={{
          position: "relative",
          background: BG_CARD,
          border: `1px solid ${GOLD}25`,
          borderRadius: 12,
          padding: "16px 18px",
          marginBottom: 16,
          cursor: "pointer",
          overflow: "hidden",
          fontFamily: "monospace",
          width: "100%",
          maxWidth: 765,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Konten blur di belakang */}
        <div
          style={{ filter: "blur(4px)", opacity: 0.5, pointerEvents: "none" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: "1rem" }}>⚡</span>
            <span
              style={{
                color: GOLD,
                fontWeight: 800,
                letterSpacing: "0.1em",
                fontSize: "0.85rem",
              }}
            >
              XAUUSD DAILY BIAS
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: RED, fontWeight: 700, fontSize: "1.1rem" }}>
              BEARISH
            </span>
            <span style={{ color: TEXT_MID, fontSize: "0.8rem" }}>
              68% confidence
            </span>
          </div>
        </div>
        {/* Overlay ajakan upgrade */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: "rgba(8,10,14,0.55)",
          }}
        >
          <span style={{ fontSize: "1.1rem" }}>🔒</span>
          <span
            style={{
              color: GOLD,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            Daily Bias Fundamental — Pro Fitur
          </span>
          <span style={{ color: TEXT_MID, fontSize: "0.6rem" }}>
            Tap untuk login / aktivasi
          </span>
        </div>
      </div>
    );
  }

  // ── User aktif tapi belum ada bias di cache ──
  if (!data) {
    return (
      <div
        onClick={() => router.push("/bias")}
        style={{
          background: BG_CARD,
          border: `1px solid ${GOLD}25`,
          borderRadius: 12,
          padding: "16px 18px",
          marginBottom: 16,
          cursor: "pointer",
          fontFamily: "monospace",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          maxWidth: 765,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.2rem" }}>⚡</span>
          <div>
            <div
              style={{
                color: GOLD,
                fontWeight: 700,
                fontSize: "0.78rem",
                letterSpacing: "0.05em",
              }}
            >
              XAUUSD Daily Bias
            </div>
            <div style={{ color: TEXT_DIM, fontSize: "0.6rem", marginTop: 2 }}>
              Belum ada analisa hari ini
            </div>
          </div>
        </div>
        <span
          style={{
            background: `${GOLD}15`,
            border: `1px solid ${GOLD}40`,
            borderRadius: 6,
            padding: "6px 14px",
            color: GOLD,
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}
        >
          GENERATE →
        </span>
      </div>
    );
  }

  // ── User aktif + ada bias ──
  const color = COLOR_MAP[data.bias] || GOLD;
  const label = LABEL_MAP[data.bias] || data.bias;
  const timeStr = generatedAt
    ? new Date(generatedAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      onClick={() => router.push("/bias")}
      style={{
        background: BG_CARD,
        border: `1px solid ${color}35`,
        borderRadius: 12,
        padding: "14px 18px",
        marginBottom: 16,
        cursor: "pointer",
        fontFamily: "monospace",
        boxShadow: `0 0 24px ${color}10`,
        width: "100%",
        maxWidth: 765,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {/* Baris atas: judul + waktu */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1rem" }}>⚡</span>
          <span
            style={{
              color: GOLD,
              fontWeight: 800,
              letterSpacing: "0.1em",
              fontSize: "0.72rem",
            }}
          >
            XAUUSD DAILY BIAS
          </span>
        </div>
        {timeStr && (
          <span style={{ color: TEXT_DIM, fontSize: "0.55rem" }}>
            {timeStr}
          </span>
        )}
      </div>

      {/* Baris tengah: bias + confidence bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            background: `${color}15`,
            border: `1px solid ${color}40`,
            borderRadius: 6,
            padding: "6px 14px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color,
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textShadow: `0 0 10px ${color}50`,
            }}
          >
            {label}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                color: TEXT_DIM,
                fontSize: "0.52rem",
                letterSpacing: "0.1em",
              }}
            >
              CONFIDENCE
            </span>
            <span style={{ color, fontSize: "0.7rem", fontWeight: 800 }}>
              {data.confidence}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 6,
              background: BORDER,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, data.confidence)}%`,
                background: `linear-gradient(90deg, ${color}99, ${color})`,
                borderRadius: 3,
                boxShadow: `0 0 8px ${color}70`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Headline + CTA */}
      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            color: TEXT_MID,
            fontSize: "0.6rem",
            fontStyle: "italic",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          "{data.headline}"
        </span>
        <span
          style={{
            color: GOLD,
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            flexShrink: 0,
          }}
        >
          LIHAT DETAIL →
        </span>
      </div>
    </div>
  );
}
