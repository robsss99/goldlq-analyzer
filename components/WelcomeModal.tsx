"use client";

import { useEffect, useState } from "react";

type UserInfo = {
  username: string;
  remaining: number;
  limit: number;
  expiresAt: string;
};

function getDaysRemaining(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function WelcomeModal({ isOpen, onClose }: Props) {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "user") {
            setUser({
              username: data.username,
              remaining: data.remaining,
              limit: data.limit,
              expiresAt: data.expiresAt,
            });
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const daysLeft = user?.expiresAt ? getDaysRemaining(user.expiresAt) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#131722] border border-yellow-400/40 rounded-2xl p-7 text-center shadow-2xl shadow-yellow-400/5">
        {/* Celebration */}
        <div className="text-5xl mb-3">🎉</div>

        <h2 className="text-xl font-bold text-white mb-1">Selamat Datang!</h2>

        {user ? (
          <p className="text-yellow-400 font-semibold text-lg mb-5">
            {user.username} 👋
          </p>
        ) : (
          <div className="h-7 bg-[#1e222d] rounded-lg w-32 mx-auto mb-5 animate-pulse" />
        )}

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Kuota */}
          <div className="bg-[#0a0e1a] border border-[#1e222d] rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Kuota Upload</p>
            {user ? (
              <>
                <p className="text-2xl font-bold text-yellow-400">
                  {user.limit}x
                </p>
                <p className="text-xs text-gray-600">analisa tersedia</p>
              </>
            ) : (
              <div className="h-8 bg-[#1e222d] rounded animate-pulse" />
            )}
          </div>

          {/* Masa Aktif */}
          <div className="bg-[#0a0e1a] border border-[#1e222d] rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Masa Aktif</p>
            {user && daysLeft !== null ? (
              <>
                <p
                  className={
                    "text-2xl font-bold " +
                    (daysLeft <= 7 ? "text-orange-400" : "text-[#26a69a]")
                  }
                >
                  {daysLeft}
                </p>
                <p className="text-xs text-gray-600">hari lagi</p>
              </>
            ) : (
              <div className="h-8 bg-[#1e222d] rounded animate-pulse" />
            )}
          </div>
        </div>

        {/* Tanggal expired */}
        {user && (
          <p className="text-xs text-gray-600 mb-5">
            Aktif hingga{" "}
            <span className="text-gray-400">{formatDate(user.expiresAt)}</span>
          </p>
        )}

        {/* CTA */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-base transition"
        >
          Mulai Analisa! 🚀
        </button>

        <p className="text-xs text-gray-600 mt-3 leading-relaxed">
          Upload screenshot chart XAUUSD dan dapatkan setup trading lengkap
          dalam hitungan detik.
        </p>
      </div>
    </div>
  );
}
