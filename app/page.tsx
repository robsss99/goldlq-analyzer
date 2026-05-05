"use client";

import { useState } from "react";

export default function Home() {
  // State untuk timeframe & trading style
  const [timeframe, setTimeframe] = useState<"D1" | "H4" | "H1" | "M15">("D1");
  const [tradingStyle, setTradingStyle] = useState<"scalping" | "swing">(
    "swing",
  );

  return (
    <main className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="border-b border-[#1e222d] bg-[#131722]/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <span className="text-black font-bold text-xl">G</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-gold">
                GoldLQ Analyzer
              </h1>
              <p className="text-xs text-gray-400">
                AI-Powered XAU/USD Analysis
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#26a69a]/10 border border-[#26a69a]/30">
            <div className="w-2 h-2 rounded-full bg-[#26a69a] animate-pulse"></div>
            <span className="text-xs text-[#26a69a] font-medium">
              AI Online
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-6">
          <span className="text-sm text-yellow-400 font-medium">
            ✨ Powered by Claude Vision AI
          </span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Analisa Chart Gold dalam{" "}
          <span className="text-gradient-gold">Hitungan Detik</span>
        </h2>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Upload screenshot chart MT5 Anda, dapatkan analisa profesional dari
          360tradersss dengan teknik{" "}
          <span className="text-yellow-400 font-semibold">
            LQ (Liquidity Quartile)
          </span>{" "}
          + Smart Money Concept lengkap dengan setup entry, SL, dan TP.
        </p>
      </section>

      {/* Upload Area */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          {/* Settings Bar */}
          <div className="bg-[#131722] border border-[#1e222d] rounded-t-2xl p-6 space-y-6">
            {/* Timeframe Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                📊 Timeframe Chart
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["D1", "H4", "H1", "M15"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                      timeframe === tf
                        ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                        : "bg-[#0a0e1a] text-gray-400 hover:text-yellow-400 border border-[#1e222d]"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Trading Style */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                🎯 Gaya Trading
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTradingStyle("scalping")}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    tradingStyle === "scalping"
                      ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                      : "bg-[#0a0e1a] text-gray-400 hover:text-yellow-400 border border-[#1e222d]"
                  }`}
                >
                  ⚡ Scalping
                </button>
                <button
                  onClick={() => setTradingStyle("swing")}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    tradingStyle === "swing"
                      ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                      : "bg-[#0a0e1a] text-gray-400 hover:text-yellow-400 border border-[#1e222d]"
                  }`}
                >
                  📈 Swing
                </button>
              </div>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div className="bg-[#131722] border border-t-0 border-[#1e222d] rounded-b-2xl p-12 text-center cursor-pointer hover:border-yellow-400/50 transition-all group">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400/20 transition-all">
                <svg
                  className="w-8 h-8 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Drop screenshot chart MT5 di sini
                </h3>
                <p className="text-gray-400 text-sm">
                  atau{" "}
                  <span className="text-yellow-400 font-medium underline">
                    klik untuk pilih file
                  </span>
                </p>
                <p className="text-gray-500 text-xs mt-3">
                  Format: PNG, JPG (max 10MB)
                </p>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-lg">💡</span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-400 mb-1">
                  Pro Tip untuk Hasil Maksimal
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Pastikan <strong>header chart MT5 terlihat</strong> di
                  screenshot (bagian yang menampilkan{" "}
                  <code className="text-yellow-400">XAUUSD Daily, O H L C</code>
                  ). Dengan header, AI bisa baca data OHLC secara{" "}
                  <strong>akurat</strong>, bukan estimasi visual.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e222d] bg-[#131722]/30 py-8 mt-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <span className="text-xl">⚖️</span>
            <p className="text-xs max-w-2xl">
              <strong>Disclaimer:</strong> GoldLQ Analyzer adalah alat bantu
              analisa, bukan financial advice. Trading mengandung risiko
              kehilangan modal. Selalu lakukan riset sendiri (DYOR) dan gunakan
              money management yang tepat.
            </p>
          </div>
          <p className="text-xs text-gray-600">
            Built with ❤️ by{" "}
            <span className="text-yellow-400">@360tradersss</span> · Powered by
            Claude AI
          </p>
        </div>
      </footer>
    </main>
  );
}
