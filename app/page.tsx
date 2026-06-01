"use client";

import { useState } from "react";
import UploadSection from "@/components/UploadSection";
import AnalysisResult from "@/components/AnalysisResult";
import StatusBanner from "@/components/StatusBanner";

export default function Home() {
  const [timeframe, setTimeframe] = useState<"D1" | "H4" | "H1" | "M15">("D1");
  const [tradingStyle, setTradingStyle] = useState<"scalping" | "swing">(
    "swing",
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [statusOverride, setStatusOverride] = useState<{
    used: number;
    remaining: number;
  } | null>(null);

  const handleAnalyze = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("timeframe", timeframe);
      formData.append("tradingStyle", tradingStyle);

      console.log("🤖 Sending analysis request...");
      const startTime = Date.now();

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (data.success) {
        console.log(`✅ Analysis completed in ${duration}s`);
        console.log("Result:", data.analysis);
        setAnalysisResult(data);

        // Update info banner real-time (trial ATAU user login)
        const newInfo = data.trial || data.user;
        if (newInfo) {
          setStatusOverride({
            used: newInfo.used,
            remaining: newInfo.remaining,
          });
        }
      } else {
        console.error("❌ API error:", data);
        setAnalysisError(data.error || "Gagal menganalisa chart");
      }
    } catch (err) {
      console.error("❌ Request failed:", err);
      setAnalysisError("Gagal connect ke server. Cek koneksi internet Anda.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="border-b border-[#1e222d] bg-[#131722]/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
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

      {/* Status Banner */}
      <StatusBanner
        overrideUsed={statusOverride?.used}
        overrideRemaining={statusOverride?.remaining}
      />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-6">
          <span className="text-sm text-yellow-400 font-medium">
            ✨ Your Ultimate Gold Chart Analysis Tool! ✨
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

      {/* Upload Section */}
      <section className="container mx-auto px-4 pb-12">
        <UploadSection
          timeframe={timeframe}
          tradingStyle={tradingStyle}
          onTimeframeChange={setTimeframe}
          onTradingStyleChange={setTradingStyle}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />

        {/* Temporary Result Display (akan diganti dengan AnalysisResult component di Step 4) */}
        {analysisError && (
          <div className="max-w-3xl mx-auto mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg">❌</span>
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-1">
                  Analisa Gagal
                </h4>
                <p className="text-xs text-gray-400">{analysisError}</p>
              </div>
            </div>
          </div>
        )}

        {analysisResult && (
          <AnalysisResult
            analysis={analysisResult.analysis}
            metadata={analysisResult.metadata}
          />
        )}
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
            <span className="text-yellow-400">@360tradersss</span>
          </p>
        </div>
      </footer>
    </main>
  );
}
