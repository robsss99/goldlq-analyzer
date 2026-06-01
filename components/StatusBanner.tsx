"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Tipe data dari /api/me
type MeStatus = {
  status: "user" | "trial" | "new";
  username?: string;
  used: number;
  limit: number;
  remaining: number;
  expiresAt?: string;
  isExpired?: boolean;
  isQuotaDone?: boolean;
  isTrialDone?: boolean;
  canAnalyze: boolean;
};

type Props = {
  // Opsional: override data dari luar (dipakai pas habis upload, biar update real-time)
  overrideRemaining?: number;
  overrideUsed?: number;
};

export default function StatusBanner({
  overrideRemaining,
  overrideUsed,
}: Props) {
  const [me, setMe] = useState<MeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Ambil status dari /api/me pas pertama kali dimount
  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        setMe(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal ambil status:", err);
        setLoading(false);
      });
  }, []);

  // Flash kuning sebentar pas angka berubah (setelah upload sukses)
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    // Skip flash pas pertama kali load (cuma flash kalau ada override beneran)
    if (overrideUsed === undefined && overrideRemaining === undefined) return;

    setIsFlashing(true);
    const timer = setTimeout(() => setIsFlashing(false), 1500);
    return () => clearTimeout(timer);
  }, [overrideUsed, overrideRemaining]);

  // Loading state: banner kosong tipis biar nggak jumpy
  if (loading) {
    return <div className="h-12"></div>;
  }

  if (!me) return null;

  // Pakai override kalau ada (setelah upload), kalau nggak pakai data asli
  const used = overrideUsed ?? me.used;
  const remaining = overrideRemaining ?? me.remaining;

  // Logout handler (buat user login)
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.refresh();
    window.location.href = "/";
  };

  // ===== TAMPILAN BERDASARKAN STATUS =====

  // 1. USER LOGIN — kuota habis
  if (me.status === "user" && me.isQuotaDone) {
    return (
      <div className="container mx-auto px-4 pt-4">
        <div className="max-w-3xl mx-auto p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="text-sm font-semibold text-orange-300">
                Kuota upload kamu habis ({me.limit}x)
              </p>
              <p className="text-xs text-gray-400">
                Hubungi admin untuk perpanjang masa aktif.
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-yellow-400 transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // 2. USER LOGIN — expired
  if (me.status === "user" && me.isExpired) {
    return (
      <div className="container mx-auto px-4 pt-4">
        <div className="max-w-3xl mx-auto p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <p className="text-sm font-semibold text-orange-300">
                Masa aktif kamu sudah habis
              </p>
              <p className="text-xs text-gray-400">
                Hubungi admin untuk perpanjang langganan.
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-yellow-400 transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // 3. USER LOGIN — normal
  if (me.status === "user") {
    return (
      <div className="container mx-auto px-4 pt-4">
        <div
          className={
            "max-w-3xl mx-auto p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 transition-all duration-500 " +
            (isFlashing
              ? "bg-yellow-400/20 border-yellow-400/60 scale-[1.02]"
              : "bg-yellow-400/5 border-yellow-400/20")
          }
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">👋</span>
            <div>
              <p className="text-sm font-semibold text-yellow-400">
                Halo, {me.username}!
              </p>
              <p className="text-xs text-gray-400">
                67:{" "}
                <span className="text-white font-semibold">
                  {remaining}/{me.limit}
                </span>{" "}
                upload
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-yellow-400 transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // 4. TRIAL — habis
  if (me.status === "trial" && me.isTrialDone) {
    return (
      <div className="container mx-auto px-4 pt-4">
        <div
          className={
            "max-w-3xl mx-auto p-5 rounded-xl border transition-all duration-500 " +
            (isFlashing
              ? "bg-yellow-400/20 border-yellow-400/60 scale-[1.02]"
              : "bg-red-500/10 border-red-500/30")
          }
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">🔒</span>
            <div className="flex-1">
              <p className="text-base font-semibold text-red-300 mb-1">
                Jatah trial gratis kamu sudah habis ({me.limit}x)
              </p>
              <p className="text-xs text-gray-400">
                Untuk lanjut menggunakan GoldLQ Analyzer, silakan login (kalau
                sudah punya akun) atau berlangganan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm transition"
            >
              🔑 Login
            </button>
            <div className="text-xs text-gray-400">
              Belum punya akun? Berlangganan{" "}
              <span className="text-yellow-400 font-semibold">
                Rp 150.000/bulan
              </span>{" "}
              (150x upload). Hubungi admin @360tradersss.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. TRIAL — masih jalan
  if (me.status === "trial") {
    return (
      <div className="container mx-auto px-4 pt-4">
        <div
          className={
            "max-w-3xl mx-auto p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 transition-all duration-500 " +
            (isFlashing
              ? "bg-yellow-400/20 border-yellow-400/60 scale-[1.02]"
              : "bg-blue-500/10 border-blue-500/30")
          }
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="text-sm font-semibold text-blue-300">
                Mode Trial:{" "}
                <span className="text-white">
                  {remaining}/{me.limit}
                </span>{" "}
                upload tersisa
              </p>
              <p className="text-xs text-gray-400">
                Login kalau sudah punya akun berlangganan.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-400 font-semibold text-xs transition"
          >
            🔑 Login
          </button>
        </div>
      </div>
    );
  }

  // 6. PENGUNJUNG BARU
  return (
    <div className="container mx-auto px-4 pt-4">
      <div className="max-w-3xl mx-auto p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div>
            <p className="text-sm font-semibold text-blue-300">
              Mode Trial: 5x upload gratis tanpa login
            </p>
            <p className="text-xs text-gray-400">
              Coba dulu, kalau cocok baru berlangganan.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-400 font-semibold text-xs transition"
        >
          🔑 Login
        </button>
      </div>
    </div>
  );
}
