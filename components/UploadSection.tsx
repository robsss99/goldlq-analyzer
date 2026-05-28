"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import TutorialModal from "./TutorialModal";

interface UploadSectionProps {
  timeframe: "D1" | "H4" | "H1" | "M15";
  tradingStyle: "scalping" | "swing";
  onTimeframeChange: (tf: "D1" | "H4" | "H1" | "M15") => void;
  onTradingStyleChange: (style: "scalping" | "swing") => void;
  onAnalyze: (file: File) => void;
  isAnalyzing: boolean;
}

export default function UploadSection({
  timeframe,
  tradingStyle,
  onTimeframeChange,
  onTradingStyleChange,
  onAnalyze,
  isAnalyzing,
}: UploadSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [wasCompressed, setWasCompressed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return "Format file harus PNG atau JPG";
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return "Ukuran file maksimal 5MB";
    }

    return null;
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const maxWidth = 1568;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.85,
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file: File) => {
    setError(null);
    setWasCompressed(false);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    let finalFile = file;

    const compressThreshold = 3 * 1024 * 1024;
    if (file.size > compressThreshold) {
      finalFile = await compressImage(file);
      setWasCompressed(true);
    }

    setSelectedFile(finalFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(finalFile);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAnalyzing) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isAnalyzing) return;

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    if (!isAnalyzing) {
      fileInputRef.current?.click();
    }
  };

  const handleReset = () => {
    if (isAnalyzing) return;
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyzeClick = () => {
    if (selectedFile && !isAnalyzing) {
      onAnalyze(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      <div className="max-w-3xl mx-auto">
        {/* Settings Bar */}
        <div className="bg-[#131722] border border-[#1e222d] rounded-t-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              📊 Timeframe Chart
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["D1", "H4", "H1", "M15"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => onTimeframeChange(tf)}
                  disabled={isAnalyzing}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    timeframe === tf
                      ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                      : "bg-[#0a0e1a] text-gray-400 hover:text-yellow-400 border border-[#1e222d]"
                  } ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              🎯 Gaya Trading
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onTradingStyleChange("scalping")}
                disabled={isAnalyzing}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  tradingStyle === "scalping"
                    ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                    : "bg-[#0a0e1a] text-gray-400 hover:text-yellow-400 border border-[#1e222d]"
                } ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                ⚡ Scalping
              </button>
              <button
                onClick={() => onTradingStyleChange("swing")}
                disabled={isAnalyzing}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  tradingStyle === "swing"
                    ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                    : "bg-[#0a0e1a] text-gray-400 hover:text-yellow-400 border border-[#1e222d]"
                } ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                📈 Swing
              </button>
            </div>
          </div>
        </div>

        {/* Upload / Preview Area */}
        {!previewUrl ? (
          <div
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`bg-[#131722] border border-t-0 rounded-b-2xl p-12 text-center cursor-pointer transition-all group ${
              isDragging
                ? "border-yellow-400 bg-yellow-400/5 scale-[1.02]"
                : "border-[#1e222d] hover:border-yellow-400/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="space-y-4">
              <div
                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all ${
                  isDragging
                    ? "bg-yellow-400/30 scale-110"
                    : "bg-yellow-400/10 group-hover:bg-yellow-400/20"
                }`}
              >
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
                  {isDragging
                    ? "🎯 Lepas file di sini!"
                    : "Drop screenshot chart MT5 di sini"}
                </h3>
                <p className="text-gray-400 text-sm">
                  atau{" "}
                  <span className="text-yellow-400 font-medium underline">
                    klik untuk pilih file
                  </span>
                </p>
                <p className="text-gray-500 text-xs mt-3">
                  Format: PNG, JPG (max 5MB)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#131722] border border-t-0 border-[#1e222d] rounded-b-2xl p-6">
            {/* Preview Image */}
            <div className="relative rounded-lg overflow-hidden border border-[#1e222d] mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Chart preview"
                className="w-full max-h-96 object-contain bg-[#0a0e1a]"
              />

              {!isAnalyzing && (
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 hover:bg-red-500 text-white flex items-center justify-center transition-all"
                  title="Hapus file"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

              {/* Loading Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="inline-block">
                      <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                    </div>
                    <div>
                      <p className="text-yellow-400 font-semibold text-lg">
                        🤖 AI sedang menganalisa...
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Estimasi 10-20 detik
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex items-center justify-between mb-4 px-3 py-2 bg-[#0a0e1a] rounded-lg border border-[#1e222d]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {selectedFile?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedFile && formatFileSize(selectedFile.size)} ·{" "}
                    {timeframe} ·{" "}
                    {tradingStyle === "scalping" ? "⚡ Scalping" : "📈 Swing"}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning Kompres */}
            {wasCompressed && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/40">
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0">⚠️</span>
                  <div className="text-xs text-yellow-200 leading-relaxed">
                    <span className="font-bold text-yellow-400">
                      File terlalu besar — dikompres otomatis.{" "}
                    </span>
                    Gambar dikompres agar bisa diproses. Hasil analisa{" "}
                    <span className="font-semibold">mungkin kurang akurat</span>
                    .{" "}
                    <span className="block mt-1">
                      💡 Gunakan{" "}
                      <span className="font-semibold">screenshot langsung</span>{" "}
                      (bukan foto kamera) dengan{" "}
                      <span className="font-semibold">
                        header OHLC terlihat jelas
                      </span>
                      .
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Analyze Button - SEKARANG FUNCTIONAL! */}
            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing || !selectedFile}
              className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-400/20"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                  Sedang menganalisa...
                </span>
              ) : (
                <>
                  🚀 Analisa dengan AI
                  <span className="block text-xs font-normal mt-1 opacity-70">
                    Tekan untuk mulai analisa menggunakan Teknikal andalan
                    360tradersss!
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg">⚠️</span>
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-1">
                  Upload Gagal
                </h4>
                <p className="text-xs text-gray-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pro Tip */}
        <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-blue-400 text-lg flex-shrink-0">💡</span>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">
                Pro Tip untuk Hasil Maksimal
              </h4>

              {/* Tip 1: Header */}
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                Pastikan <strong>header chart MT5 terlihat</strong> di
                screenshot (bagian yang menampilkan{" "}
                <code className="text-yellow-400">XAUUSD Daily, O H L C</code>).
                Dengan header, AI bisa baca data OHLC secara{" "}
                <strong>akurat</strong>, bukan estimasi visual.
              </p>

              {/* Tip 2: Closed Candle (NEW) */}
              <div className="bg-[#0a0e1a]/50 border border-yellow-400/20 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-yellow-400">⚠️ PENTING:</strong>{" "}
                  Header OHLC harus di satu{" "}
                  <strong className="text-yellow-400">
                    candle terakhir yang sudah close
                  </strong>
                  , <strong>bukan candle sekarang</strong> yang masih berjalan.
                  Arahkan cursor ke candle yang sudah selesai untuk mendapatkan
                  data final.
                </p>
              </div>

              {/* Tip 3: Best Setting Recommendation (NEW) */}
              <div className="bg-[#26a69a]/5 border border-[#26a69a]/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-[#26a69a] text-base flex-shrink-0">
                    🎯
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    <strong className="text-[#26a69a]">
                      Untuk hasil dengan akurasi tinggi
                    </strong>
                    , disarankan menggunakan kombinasi:
                    <span className="inline-flex items-center gap-1 mx-1">
                      <code className="bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded text-xs font-semibold">
                        Swing
                      </code>
                      <span className="text-gray-500">+</span>
                      <code className="bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded text-xs font-semibold">
                        Daily (D1)
                      </code>
                    </span>
                    . Timeframe besar memberikan struktur yang lebih jelas dan
                    pattern yang lebih terbaca oleh AI.
                  </p>
                </div>
              </div>
              {/* Tombol Tutorial Video */}
              <button
                onClick={() => setShowTutorial(true)}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm transition-all"
              >
                <span className="text-base">🎬</span>
                <span>Lihat Video Tutorial Penggunaan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </>
  );
}
