"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!username.trim() || !accessCode.trim()) {
      setError("Username dan access code wajib diisi");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, accessCode }),
      });

      const data = await res.json();

      if (data.success) {
        // /?welcome=1 → trigger welcome modal di homepage
        router.push("/?welcome=1");
      } else {
        setError(data.message || "Login gagal");
      }
    } catch {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] px-4">
      {/* Tombol Kembali */}
      <Link
        href="/"
        className="fixed top-4 left-4 flex items-center gap-1.5 text-xs text-gray-500 hover:text-yellow-400 transition px-3 py-1.5 rounded-lg border border-[#1e222d] hover:border-yellow-400/30 bg-[#131722]"
      >
        ← Kembali
      </Link>

      <div className="w-full max-w-md">
        {/* Logo / Judul */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-yellow-400">GoldLQ</span>{" "}
            <span className="text-white">Analyzer</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Masuk untuk mengakses analisa AI
          </p>
        </div>

        {/* Card Login */}
        <div className="bg-[#131722] border border-[#1e222d] rounded-2xl p-6 space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Masukkan username"
              className="w-full px-4 py-3 rounded-lg bg-[#0a0e1a] border border-[#1e222d] text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          {/* Access Code */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Access Code
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Masukkan access code"
              className="w-full px-4 py-3 rounded-lg bg-[#0a0e1a] border border-[#1e222d] text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Tombol Login */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </div>

        {/* Info bawah */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Belum punya akses?{" "}
          <Link
            href="/fullversion"
            className="text-yellow-400 hover:underline font-medium"
          >
            Lihat cara berlangganan →
          </Link>
        </p>
      </div>
    </div>
  );
}
