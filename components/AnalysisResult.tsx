"use client";

import { useState } from "react";
import TutorialModal from "./TutorialModal";

interface AnalysisData {
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
    currentPrice: number;
    readSource: "header" | "visual_estimate";
  };
  timeframe: string;
  lq: {
    value: number;
    zone: "PREMIUM" | "DISCOUNT" | "EQUILIBRIUM";
    distancePips: number;
  };
  structure: {
    trend: "BULLISH" | "BEARISH" | "SIDEWAYS";
    trendStrength: "KUAT" | "SEDANG" | "LEMAH";
    liquiditySwept: boolean;
    candlePattern: string;
    keyLevels: {
      resistance: number[];
      support: number[];
    };
  };
  bias: {
    direction: "BUY" | "SELL" | "WAIT";
    reasoning: string;
  };
  setup: {
    validity: "KUAT" | "SEDANG" | "LEMAH";
    entryZone: {
      min: number;
      max: number;
    };
    stopLoss: number;
    takeProfits: Array<{
      level: number;
      label: string;
      pips: number;
    }>;
    riskRewardRatio: number;
    riskPips: number;
  };
  warnings: string[];
  notes: string;
  recommendation: string;
  scenarios?: {
    ifTpHit: {
      title: string;
      steps: string[];
    };
    ifSlHit: {
      title: string;
      steps: string[];
    };
  };
}

interface AnalysisResultProps {
  analysis: AnalysisData;
  metadata: {
    processingTime: string;
    model: string;
    timeframe: string;
    tradingStyle: string;
  };
}

export default function AnalysisResult({
  analysis,
  metadata,
}: AnalysisResultProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const getTrendColor = (trend: string) => {
    if (trend === "BULLISH") return "text-[#26a69a]";
    if (trend === "BEARISH") return "text-[#ef5350]";
    return "text-gray-400";
  };

  const getTrendBg = (trend: string) => {
    if (trend === "BULLISH") return "bg-[#26a69a]/10 border-[#26a69a]/30";
    if (trend === "BEARISH") return "bg-[#ef5350]/10 border-[#ef5350]/30";
    return "bg-gray-500/10 border-gray-500/30";
  };

  const getBiasColor = (direction: string) => {
    if (direction === "BUY") return "text-[#26a69a]";
    if (direction === "SELL") return "text-[#ef5350]";
    return "text-yellow-400";
  };

  const getBiasBg = (direction: string) => {
    if (direction === "BUY") return "bg-[#26a69a]/10 border-[#26a69a]/30";
    if (direction === "SELL") return "bg-[#ef5350]/10 border-[#ef5350]/30";
    return "bg-yellow-400/10 border-yellow-400/30";
  };

  const getValidityColor = (validity: string) => {
    if (validity === "KUAT") return "text-[#26a69a]";
    if (validity === "SEDANG") return "text-yellow-400";
    return "text-[#ef5350]";
  };

  const getZoneColor = (zone: string) => {
    if (zone === "PREMIUM") return "text-[#ef5350]";
    if (zone === "DISCOUNT") return "text-[#26a69a]";
    return "text-yellow-400";
  };

  const calcBarWidth = (pips: number, riskPips: number): string => {
    const ratio = (pips / riskPips) * 33;
    const capped = Math.min(ratio, 100);
    return capped + "%";
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-4">
      {/* Header */}
      <div className="bg-[#131722] border border-yellow-400/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h2 className="text-2xl font-bold text-gradient-gold">
                Hasil Analisa AI
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Processing: {metadata.processingTime} · {metadata.timeframe} ·{" "}
                {metadata.tradingStyle === "scalping"
                  ? "⚡ Scalping"
                  : "📈 Swing"}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Warning - No Header Detected */}
      {analysis.ohlc.readSource === "visual_estimate" && (
        <div className="bg-[#ef5350]/10 border-2 border-[#ef5350] rounded-2xl p-6 animate-pulse-slow">
          <div className="flex items-start gap-4">
            <div className="text-4xl shrink-0">🚨</div>
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-[#ef5350] mb-2">
                PERHATIAN! Header Chart Tidak Terdeteksi
              </h3>
              <p className="text-sm text-gray-200 mb-3 leading-relaxed">
                Screenshot yang Anda upload{" "}
                <strong className="text-[#ef5350]">
                  tidak menampilkan header XAUUSD dengan data OHLC
                </strong>
                . Hasil di bawah adalah{" "}
                <strong className="text-yellow-400">ESTIMASI VISUAL</strong>{" "}
                dari AI,
                <strong className="text-[#ef5350]">
                  {" "}
                  BUKAN data akurat dari chart Anda
                </strong>
                .
              </p>

              {/* CTA Button - Open Tutorial */}
              <button
                onClick={() => setShowTutorial(true)}
                className="mt-2 mb-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm transition-all shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:scale-105"
              >
                <span className="text-lg">📚</span>
                <span>Lihat Cara Upload Screenshot yang Benar</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <div className="bg-[#0a0e1a] border border-[#ef5350]/30 rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-300 mb-2">
                  <strong className="text-yellow-400">
                    💡 Quick Tips Akurasi:
                  </strong>
                </p>
                <ul className="text-xs text-gray-400 space-y-1.5 list-none">
                  <li className="flex items-start gap-2">
                    <span className="text-[#26a69a]">✓</span>
                    <span>
                      Upload screenshot dengan{" "}
                      <strong>header MT5 terlihat</strong> (bagian atas chart:{" "}
                      <code className="text-yellow-400">
                        XAUUSD Daily, O H L C
                      </code>
                      )
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#26a69a]">✓</span>
                    <span>
                      <strong className="text-yellow-400">PENTING:</strong>{" "}
                      Header dan{" "}
                      <strong>cursor di chart WAJIB di satu candle</strong> yang
                      sudah <strong className="text-[#26a69a]">closed</strong>{" "}
                      (sudah selesai), bukan candle yang sedang berjalan
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#26a69a]">✓</span>
                    <span>
                      Pastikan angka OHLC <strong>bisa terbaca</strong> dengan
                      jelas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#26a69a]">✓</span>
                    <span>
                      Hindari crop bagian atas chart yang berisi data harga
                    </span>
                  </li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">
                ⚠️ Trading dengan estimasi visual mengandung risiko lebih
                tinggi. Re-upload chart untuk mendapatkan analisa yang lebih
                akurat.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      {/* OHLC Data */}
      <div className="bg-[#131722] border border-[#1e222d] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>📊</span> Data OHLC
          </h3>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              analysis.ohlc.readSource === "header"
                ? "bg-[#26a69a]/10 text-[#26a69a] border border-[#26a69a]/30"
                : "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
            }`}
          >
            {analysis.ohlc.readSource === "header"
              ? "✅ Akurat (Header)"
              : "⚠️ Estimasi Visual"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#0a0e1a] rounded-lg p-3 border border-[#1e222d]">
            <p className="text-xs text-gray-500 mb-1">OPEN</p>
            <p className="text-lg font-mono font-semibold">
              {analysis.ohlc.open.toFixed(2)}
            </p>
          </div>
          <div className="bg-[#0a0e1a] rounded-lg p-3 border border-[#26a69a]/30">
            <p className="text-xs text-[#26a69a] mb-1">HIGH</p>
            <p className="text-lg font-mono font-semibold text-[#26a69a]">
              {analysis.ohlc.high.toFixed(2)}
            </p>
          </div>
          <div className="bg-[#0a0e1a] rounded-lg p-3 border border-[#ef5350]/30">
            <p className="text-xs text-[#ef5350] mb-1">LOW</p>
            <p className="text-lg font-mono font-semibold text-[#ef5350]">
              {analysis.ohlc.low.toFixed(2)}
            </p>
          </div>
          <div className="bg-[#0a0e1a] rounded-lg p-3 border border-[#1e222d]">
            <p className="text-xs text-gray-500 mb-1">CLOSE</p>
            <p className="text-lg font-mono font-semibold">
              {analysis.ohlc.close.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#1e222d] flex items-center justify-between">
          <span className="text-sm text-gray-400">Current Price:</span>
          <span className="text-xl font-mono font-bold text-yellow-400">
            {analysis.ohlc.currentPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* LQ Equilibrium */}
      <div className="bg-[#131722] border border-yellow-400/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <span>💎</span> LQ (Liquidity Quartile)
        </h3>

        <div className="text-center mb-4">
          <p className="text-xs text-gray-400 mb-1">Equilibrium Price</p>
          <p className="text-4xl font-mono font-bold text-gradient-gold">
            {analysis.lq.value.toFixed(2)}
          </p>
        </div>

        <div className="bg-[#0a0e1a] rounded-lg p-4 border border-[#1e222d]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Zone:</span>
            <span
              className={"text-lg font-bold " + getZoneColor(analysis.lq.zone)}
            >
              {analysis.lq.zone === "DISCOUNT" && "🔻"}
              {analysis.lq.zone === "PREMIUM" && "🔺"}
              {analysis.lq.zone === "EQUILIBRIUM" && "⚖️"} {analysis.lq.zone}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-400">Distance from LQ:</span>
            <span className="text-sm font-mono text-gray-300">
              {analysis.lq.distancePips} pips
            </span>
          </div>
        </div>
      </div>

      {/* Trend & Bias Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={
            "border rounded-2xl p-6 " + getTrendBg(analysis.structure.trend)
          }
        >
          <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <span>📈</span> Trend
          </h3>
          <p
            className={
              "text-2xl font-bold " + getTrendColor(analysis.structure.trend)
            }
          >
            {analysis.structure.trend}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Strength: {analysis.structure.trendStrength}
          </p>
        </div>

        <div
          className={
            "border rounded-2xl p-6 " + getBiasBg(analysis.bias.direction)
          }
        >
          <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <span>🎯</span> Bias Direction
          </h3>
          <p
            className={
              "text-2xl font-bold " + getBiasColor(analysis.bias.direction)
            }
          >
            {analysis.bias.direction === "BUY" && "🟢"}
            {analysis.bias.direction === "SELL" && "🔴"}
            {analysis.bias.direction === "WAIT" && "⏸️"}{" "}
            {analysis.bias.direction}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {analysis.bias.reasoning}
          </p>
        </div>
      </div>

      {/* Structure Detail */}
      <div className="bg-[#131722] border border-[#1e222d] rounded-2xl p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <span>🏗️</span> Struktur Detail
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-[#0a0e1a] rounded-lg border border-[#1e222d]">
            <span className="text-yellow-400">🕯️</span>
            <div>
              <p className="text-xs text-gray-400">Candle Pattern</p>
              <p className="text-sm text-gray-200">
                {analysis.structure.candlePattern}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0a0e1a] rounded-lg border border-[#1e222d]">
            <span className="text-sm text-gray-400">Liquidity Sweep:</span>
            <span
              className={
                "text-sm font-semibold " +
                (analysis.structure.liquiditySwept
                  ? "text-[#26a69a]"
                  : "text-gray-500")
              }
            >
              {analysis.structure.liquiditySwept ? "✅ Terjadi" : "❌ Belum"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#0a0e1a] rounded-lg border border-[#ef5350]/30">
              <p className="text-xs text-[#ef5350] mb-2">🔺 Resistance</p>
              {analysis.structure.keyLevels.resistance.map((level, idx) => (
                <p key={idx} className="text-sm font-mono text-gray-200">
                  {level.toFixed(2)}
                </p>
              ))}
            </div>
            <div className="p-3 bg-[#0a0e1a] rounded-lg border border-[#26a69a]/30">
              <p className="text-xs text-[#26a69a] mb-2">🔻 Support</p>
              {analysis.structure.keyLevels.support.map((level, idx) => (
                <p key={idx} className="text-sm font-mono text-gray-200">
                  {level.toFixed(2)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trading Setup */}
      <div className="bg-[#131722] border border-yellow-400/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>🚀</span> Trading Setup
          </h3>
          <span
            className={
              "text-xs px-3 py-1 rounded-full bg-[#0a0e1a] border " +
              (analysis.setup.validity === "KUAT"
                ? "border-[#26a69a]/30"
                : analysis.setup.validity === "SEDANG"
                  ? "border-yellow-400/30"
                  : "border-[#ef5350]/30") +
              " " +
              getValidityColor(analysis.setup.validity)
            }
          >
            Validitas: {analysis.setup.validity}
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-[#0a0e1a] rounded-lg border border-yellow-400/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">🚪 Entry Zone:</span>
              <span className="text-base font-mono font-semibold text-yellow-400">
                {analysis.setup.entryZone.min.toFixed(2)} -{" "}
                {analysis.setup.entryZone.max.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#0a0e1a] rounded-lg border border-[#ef5350]/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">🛑 Stop Loss:</span>
              <span className="text-base font-mono font-semibold text-[#ef5350]">
                {analysis.setup.stopLoss.toFixed(2)}{" "}
                <span className="text-xs">
                  ({analysis.setup.riskPips} pips)
                </span>
              </span>
            </div>
          </div>

          {analysis.setup.takeProfits.map((tp, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#0a0e1a] rounded-lg border border-[#26a69a]/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  🎯 TP{idx + 1}: {tp.label}
                </span>
                <span className="text-base font-mono font-semibold text-[#26a69a]">
                  {tp.level.toFixed(2)}{" "}
                  <span className="text-xs">(+{tp.pips} pips)</span>
                </span>
              </div>
              <div className="w-full bg-[#1e222d] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#26a69a] to-[#26a69a]/50 rounded-full"
                  style={{
                    width: calcBarWidth(tp.pips, analysis.setup.riskPips),
                  }}
                ></div>
              </div>
            </div>
          ))}

          <div className="mt-4 p-4 bg-linear-to-r from-yellow-400/10 to-yellow-500/10 rounded-lg border border-yellow-400/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">
                ⚖️ Risk:Reward Ratio
              </span>
              <span className="text-2xl font-bold text-gradient-gold">
                1:{analysis.setup.riskRewardRatio.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {analysis.warnings && analysis.warnings.length > 0 && (
        <div className="bg-[#ef5350]/5 border border-[#ef5350]/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-[#ef5350]">
            <span>⚠️</span> Peringatan
          </h3>
          <ul className="space-y-2">
            {analysis.warnings.map((warning, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <span className="text-[#ef5350] mt-1">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {analysis.notes && (
        <div className="bg-blue-500/5 border border-blue-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-blue-400">
            <span>📝</span> Catatan Analisa
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {analysis.notes}
          </p>
        </div>
      )}

      {/* Recommendation */}
      {analysis.recommendation && (
        <div className="bg-yellow-400/5 border border-yellow-400/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-yellow-400">
            <span>💡</span> Rekomendasi
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {analysis.recommendation}
          </p>
        </div>
      )}

      {/* Skenario Lanjutan (Playbook) */}
      {analysis.scenarios && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Jika TP */}
          <div className="bg-[#26a69a]/5 border border-[#26a69a]/30 rounded-2xl p-6">
            <h3 className="text-base font-semibold flex items-center gap-2 mb-3 text-[#26a69a]">
              <span>✅</span> {analysis.scenarios.ifTpHit.title}
            </h3>
            <ul className="space-y-2.5">
              {analysis.scenarios.ifTpHit.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-300 leading-relaxed"
                >
                  <span className="text-[#26a69a] mt-0.5 shrink-0">→</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Jika SL */}
          <div className="bg-[#ef5350]/5 border border-[#ef5350]/30 rounded-2xl p-6">
            <h3 className="text-base font-semibold flex items-center gap-2 mb-3 text-[#ef5350]">
              <span>🛑</span> {analysis.scenarios.ifSlHit.title}
            </h3>
            <ul className="space-y-2.5">
              {analysis.scenarios.ifSlHit.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-300 leading-relaxed"
                >
                  <span className="text-[#ef5350] mt-0.5 shrink-0">→</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
