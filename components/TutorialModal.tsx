"use client";

import { useEffect } from "react";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#131722] border border-yellow-400/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-yellow-400/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#131722] border-b border-[#1e222d] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gradient-gold">
                Cara Upload Screenshot yang Benar
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Tutorial agar AI bisa analisa secara akurat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1e222d] hover:bg-[#ef5350]/20 text-gray-400 hover:text-[#ef5350] flex items-center justify-center transition-all flex-shrink-0"
            aria-label="Tutup"
          >
            <svg
              className="w-5 h-5"
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Video Section (Placeholder) */}
          <div className="aspect-video bg-[#0a0e1a] rounded-xl border border-[#1e222d] flex items-center justify-center relative overflow-hidden">
            <div className="text-center space-y-3 px-4">
              <div className="text-6xl">🎬</div>
              <div>
                <p className="text-yellow-400 font-semibold text-lg">
                  Video Tutorial Coming Soon
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Video 30 detik akan segera tersedia
                </p>
              </div>
            </div>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-yellow-400/5 to-transparent pointer-events-none"></div>
          </div>

          {/* Step by Step Guide */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📝</span> Langkah-langkah Upload yang Benar
            </h3>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex gap-4 p-4 bg-[#0a0e1a] rounded-xl border border-[#1e222d]">
                <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-400 mb-1">
                    Buka Chart XAUUSD di MT5
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Pastikan Anda sedang melihat chart{" "}
                    <strong className="text-yellow-400">XAUUSD (Gold)</strong>{" "}
                    di aplikasi MT5 (Mobile atau Desktop)
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 p-4 bg-[#0a0e1a] rounded-xl border border-[#1e222d]">
                <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-400 mb-1">
                    Pastikan Header Chart Terlihat
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed mb-2">
                    Bagian atas chart harus menampilkan informasi:
                  </p>
                  <div className="bg-[#131722] border border-yellow-400/20 rounded-lg p-3 font-mono text-xs">
                    <span className="text-yellow-400">XAUUSD</span>
                    <span className="text-gray-500"> · </span>
                    <span className="text-blue-400">Daily</span>
                    <span className="text-gray-500"> · </span>
                    <span className="text-[#26a69a]">O</span>
                    <span className="text-gray-400"> 4536.44 </span>
                    <span className="text-[#26a69a]">H</span>
                    <span className="text-gray-400"> 4580.27 </span>
                    <span className="text-[#ef5350]">L</span>
                    <span className="text-gray-400"> 4533.06 </span>
                    <span className="text-[#26a69a]">C</span>
                    <span className="text-gray-400"> 4570.90</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    💡 Tap/klik pada chart untuk memunculkan header jika belum
                    terlihat
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 p-4 bg-[#0a0e1a] rounded-xl border border-[#1e222d]">
                <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-400 mb-1">
                    Cara agar Header di MT5 Terbaca dengan Akurat
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">
                    Aktifkan{" "}
                    <strong className="text-yellow-400">Cursor di Chart</strong>
                    , lalu <strong className="text-[#ef5350]">WAJIB</strong>{" "}
                    arahkan cursor ke satu{" "}
                    <strong className="text-[#26a69a]">
                      candle yang sudah terjadi (closed candle)
                    </strong>
                    , <strong>bukan</strong> candle yang sedang berjalan saat
                    ini.
                  </p>

                  {/* Why explanation */}
                  <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-300 leading-relaxed">
                      <strong className="text-yellow-400">
                        💡 Kenapa harus candle yang sudah closed?
                      </strong>
                      <br />
                      Candle yang masih berjalan memiliki OHLC yang{" "}
                      <strong>masih berubah-ubah</strong> setiap detik.
                      Sedangkan candle yang sudah closed memiliki OHLC yang
                      sudah <strong>final & akurat</strong> untuk dianalisa AI.
                    </p>
                  </div>

                  {/* Visual comparison */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-[#26a69a]/10 border border-[#26a69a]/30 rounded-lg p-2 text-center">
                      <p className="text-2xl mb-1">✅</p>
                      <p className="text-xs text-[#26a69a] font-semibold">
                        BENAR
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Cursor di candle yang sudah closed
                      </p>
                    </div>
                    <div className="bg-[#ef5350]/10 border border-[#ef5350]/30 rounded-lg p-2 text-center">
                      <p className="text-2xl mb-1">❌</p>
                      <p className="text-xs text-[#ef5350] font-semibold">
                        SALAH
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Cursor di candle yang masih berjalan
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 p-4 bg-[#0a0e1a] rounded-xl border border-[#1e222d]">
                <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-400 mb-1">
                    Upload ke GoldLQ Analyzer
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Drag & drop atau klik untuk pilih file. Pilih{" "}
                    <strong className="text-yellow-400">timeframe</strong> dan{" "}
                    <strong className="text-yellow-400">gaya trading</strong>{" "}
                    yang sesuai, lalu klik tombol{" "}
                    <strong className="text-yellow-400">
                      &quot;Analisa dengan AI&quot;
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-500/5 border border-blue-500/30 rounded-xl p-4">
            <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <span>💡</span> Tips Pro untuk Hasil Terbaik
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Gunakan <strong>candle yang jelas</strong> - hindari chart
                  yang terlalu ramai dengan banyak indikator
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Pastikan <strong>angka harga di samping kanan</strong> chart
                  bisa terbaca dengan jelas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Untuk hasil <strong>multi-timeframe analysis</strong>, upload
                  chart yang sama di timeframe berbeda satu per satu
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Format yang didukung:{" "}
                  <strong className="text-yellow-400">PNG, JPG</strong>{" "}
                  (maksimal <strong>10MB</strong>)
                </span>
              </li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold bg-linear-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg shadow-yellow-400/20"
          >
            ✅ Saya Mengerti, Tutup Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
