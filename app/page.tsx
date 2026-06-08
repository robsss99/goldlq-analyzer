"use client";

import { useState, useEffect } from "react";
import UploadSection from "@/components/UploadSection";
import AnalysisResult from "@/components/AnalysisResult";
import StatusBanner from "@/components/StatusBanner";
import WelcomeModal from "@/components/WelcomeModal";

const TRADING_QUOTES = [
  {
    text: "Trader sukses bukan yang selalu benar, tapi yang bisa mengontrol kerugiannya.",
    author: "Prinsip Trading",
  },
  {
    text: "SL bukan tanda kekalahan — itu tanda kamu menghormati modal kamu.",
    author: "Risk Management",
  },
  {
    text: "1% risiko per trade, 100 trade pun kamu masih hidup untuk belajar.",
    author: "Money Management",
  },
  {
    text: "Profit terbesar datang dari trade yang paling disiplin, bukan yang paling agresif.",
    author: "Trading Mindset",
  },
  {
    text: "Pasar selalu ada besok. Modal yang habis — tidak.",
    author: "Capital Preservation",
  },
  {
    text: "Risk management adalah fondasi, analisa adalah atapnya. Jangan bangun rumah tanpa fondasi.",
    author: "Trading Philosophy",
  },
  {
    text: "Bukan soal berapa kali kamu benar, tapi berapa besar kamu untung vs berapa kecil kamu rugi.",
    author: "Expectancy",
  },
  {
    text: "Trade tanpa SL ibarat nyetir tanpa rem — aman mungkin sekarang, tapi berbahaya selamanya.",
    author: "Risk Discipline",
  },
];

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

  const [showWelcome, setShowWelcome] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // Random quote - harus di client bukan SSR
    setQuoteIndex(Math.floor(Math.random() * TRADING_QUOTES.length));
    if (window.location.search.includes("welcome=1")) {
      // Bersihkan URL param tanpa reload
      window.history.replaceState({}, "", "/");
      setShowWelcome(true);
    }
  }, []);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
        showToast(
          "✅ Analisa selesai! Scroll ke bawah untuk melihat hasil.",
          "success",
        );

        // Update info banner real-time (trial ATAU user login)
        const newInfo = data.trial || data.user;
        console.log("🔍 DEBUG:", {
          trial: data.trial,
          user: data.user,
          newInfo: newInfo,
        });
        if (newInfo) {
          setStatusOverride({
            used: newInfo.used,
            remaining: newInfo.remaining,
          });
        }
      } else {
        console.error("❌ API error:", data);
        setAnalysisError(data.error || "Gagal menganalisa chart");
        showToast("❌ " + (data.error || "Analisa gagal"), "error");
      }
    } catch (err) {
      console.error("❌ Request failed:", err);
      setAnalysisError("Gagal connect ke server. Cek koneksi internet Anda.");
      showToast(
        "❌ Gagal connect ke server. Cek koneksi internet Anda.",
        "error",
      );
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
          Upload screenshot chart XAUUSD Anda, dapatkan analisa profesional dari
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
          hideProTip={
            analysisResult !== null &&
            analysisResult.analysis?.ohlc?.readSource === "header"
          }
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

        {/* Empty State — muncul sebelum analisa pertama */}
        {/* Empty State dengan quote acak */}
        {!analysisResult && !isAnalyzing && (
          <div className="max-w-3xl mx-auto mt-6">
            <div className="border border-dashed border-[#1e222d] rounded-2xl p-8 md:p-10">
              {/* Quote acak */}
              <div className="text-center mb-6">
                <p className="text-gray-300 text-sm italic leading-relaxed mb-2 max-w-sm mx-auto">
                  "{TRADING_QUOTES[quoteIndex].text}"
                </p>
                <p className="text-xs text-yellow-400/70">
                  — {TRADING_QUOTES[quoteIndex].author}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-[#1e222d] mb-6" />

              {/* Preview items */}
              <p className="text-gray-600 text-xs text-center mb-3">
                Upload chart di atas untuk mendapatkan:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-sm mx-auto">
                {[
                  "📊 Data OHLC",
                  "💎 LQ Equilibrium",
                  "🎯 Entry / SL / TP",
                  "🏗️ Struktur Trend",
                  "📋 Playbook Skenario",
                  "⚖️ Risk:Reward Ratio",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-[#131722] border border-[#1e222d] rounded-lg px-3 py-2"
                  >
                    <p className="text-xs text-gray-500">{item}</p>
                  </div>
                ))}
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

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-50">
          <div
            className={
              "px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold text-center " +
              (toast.type === "success"
                ? "bg-[#26a69a] text-white"
                : "bg-[#ef5350] text-white")
            }
          >
            {toast.message}
          </div>
        </div>
      )}
    </main>
  );
}
