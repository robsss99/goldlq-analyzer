"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Tipe data dari /api/me
type MeStatus = {
  status: "user" | "trial" | "has_account";
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

function getDaysRemaining(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

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
              <button
                onClick={() => router.push("/fullversion")}
                className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-medium transition mt-1"
              >
                Lihat cara perpanjang →
              </button>
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
              <button
                onClick={() => router.push("/fullversion")}
                className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-medium transition mt-1"
              >
                Lihat cara perpanjang →
              </button>
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
    const daysLeft = me.expiresAt ? getDaysRemaining(me.expiresAt) : null;
    const daysColor =
      daysLeft === null || daysLeft > 7
        ? "text-gray-500"
        : daysLeft > 3
          ? "text-yellow-400"
          : "text-red-400";

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
                Sisa kuota:{" "}
                <span className="text-white font-semibold">
                  {remaining}/{me.limit}
                </span>{" "}
                upload
                {daysLeft !== null && (
                  <span className={"ml-2 " + daysColor}>
                    · {daysLeft} hari lagi
                  </span>
                )}
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

  // 4. PUNYA AKUN — tapi belum login
  if (me.status === "has_account") {
    return (
      <div className="container mx-auto px-4 pt-4">
        <div className="max-w-3xl mx-auto p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-sm font-semibold text-yellow-400">
                Kamu sudah punya akun!
              </p>
              <p className="text-xs text-gray-400">
                Login untuk lanjut analisa dengan kuota penuh.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-xs transition"
          >
            🔑 Login
          </button>
        </div>
      </div>
    );
  }

  // 5. TRIAL — habis
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
            <a
              href="/fullversion"
              className="px-4 py-2 rounded-lg bg-[#26a69a]/10 hover:bg-[#26a69a]/20 border border-[#26a69a]/30 text-[#26a69a] font-semibold text-sm transition"
            >
              📋 Lihat cara berlangganan →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 6. TRIAL — masih jalan
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
                Coba dulu{" "}
                <span className="text-white">
                  {remaining}/{me.limit}
                </span>{" "}
                upload tersisa. Kalau cocok baru deh lanjut berlangganan!
              </p>
              <p className="text-xs text-gray-400">
                Login kalau sudah punya akun.{" "}
                <a
                  href="/fullversion"
                  className="text-yellow-400/80 hover:text-yellow-400 underline transition"
                >
                  Belum punya? Lihat cara berlangganan →
                </a>
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

  // 6. Fallback (seharusnya nggak bakal kejadian cuma buat keamanan)
  return null;
}
