"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

// Types untuk props
interface UploadSectionProps {
  timeframe: "D1" | "H4" | "H1" | "M15";
  tradingStyle: "scalping" | "swing";
  onTimeframeChange: (tf: "D1" | "H4" | "H1" | "M15") => void;
  onTradingStyleChange: (style: "scalping" | "swing") => void;
}

export default function UploadSection({
  timeframe,
  tradingStyle,
  onTimeframeChange,
  onTradingStyleChange,
}: UploadSectionProps) {
  // State untuk file management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref untuk hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validasi file
  const validateFile = (file: File): string | null => {
    // Cek format
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return "Format file harus PNG atau JPG";
    }

    // Cek ukuran (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "Ukuran file maksimal 10MB";
    }

    return null;
  };

  // Handle file selection
  const handleFile = (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);

    // Buat preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle file dari input
  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Handle drag events
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
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

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // Trigger hidden file input
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Reset file
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
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
                onClick={() => onTimeframeChange(tf)}
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
              onClick={() => onTradingStyleChange("scalping")}
              className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                tradingStyle === "scalping"
                  ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                  : "bg-[#0a0e1a] text-gray-400 hover:text-yellow-400 border border-[#1e222d]"
              }`}
            >
              ⚡ Scalping
            </button>
            <button
              onClick={() => onTradingStyleChange("swing")}
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

      {/* Upload / Preview Area */}
      {!previewUrl ? (
        // STATE: Belum ada file (Upload Area)
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
                Format: PNG, JPG (max 10MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        // STATE: Sudah ada file (Preview Area)
        <div className="bg-[#131722] border border-t-0 border-[#1e222d] rounded-b-2xl p-6">
          {/* Preview Image */}
          <div className="relative rounded-lg overflow-hidden border border-[#1e222d] mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Chart preview"
              className="w-full max-h-96 object-contain bg-[#0a0e1a]"
            />

            {/* Remove button overlay */}
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

          {/* Analyze Button */}
          <button
            disabled
            className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-400/20"
          >
            🚀 Analisa dengan AI
            <span className="block text-xs font-normal mt-1 opacity-70">
              (Coming in Day 4 - Connect to Claude API)
            </span>
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
          <span className="text-blue-400 text-lg">💡</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-400 mb-1">
              Pro Tip untuk Hasil Maksimal
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Pastikan <strong>header chart MT5 terlihat</strong> di screenshot
              (bagian yang menampilkan{" "}
              <code className="text-yellow-400">XAUUSD Daily, O H L C</code>
              ). Dengan header, AI bisa baca data OHLC secara{" "}
              <strong>akurat</strong>, bukan estimasi visual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
