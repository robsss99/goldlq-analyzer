"use client";

import { useState } from "react";
import UploadSection from "@/components/UploadSection";

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

      {/* Upload Section (sekarang component terpisah!) */}
      <section className="container mx-auto px-4 pb-12">
        <UploadSection
          timeframe={timeframe}
          tradingStyle={tradingStyle}
          onTimeframeChange={setTimeframe}
          onTradingStyleChange={setTradingStyle}
        />
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
            Built with 💕 by{" "}
            <span className="text-yellow-400">@360tradersss</span> · Powered by
            Claude AI
          </p>
        </div>
      </footer>
    </main>
  );
}
