"use client";

import { useEffect, useState } from "react";

// Tipe data
type User = {
  id: string;
  username: string;
  access_code: string;
  is_active: boolean;
  expires_at: string;
  upload_count: number;
  upload_limit: number;
  created_at: string;
};

type Stats = {
  users: { total: number; active: number; totalUploads: number };
  trials: {
    total: number;
    active: number;
    completed: number;
    totalUploads: number;
  };
};

type Activity = {
  dates: string[];
  trials: number[];
  users: number[];
  sources: [string, number][];
};

// Helper: generate access code random
function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (n: number) =>
    Array.from(
      { length: n },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return "GOLD-" + part(4) + "-" + part(4);
}

// Helper: format tanggal
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDayLabel(dateStr: string): string {
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  return days[new Date(dateStr + "T12:00:00").getDay()];
}

// Helper: cek expired
function isExpired(iso: string) {
  return new Date(iso) < new Date();
}

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Form tambah user
  const [form, setForm] = useState({
    username: "",
    access_code: generateCode(),
    duration: "1",
    customDuration: "",
    useCustom: false,
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action loading state
  const [actionLoading, setActionLoading] = useState<string>("");

  // Check auth saat pertama load
  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => {
        if (res.ok) {
          setIsAuth(true);
          loadData();
        }
        setIsChecking(false);
      })
      .catch(() => setIsChecking(false));
  }, []);

  async function loadData() {
    setIsLoadingData(true);
    try {
      const [usersRes, statsRes, activityRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/stats"),
        fetch("/api/admin/activity"),
      ]);
      const usersData = await usersRes.json();
      const statsData = await statsRes.json();
      const activityData = await activityRes.json();
      setUsers(usersData.users || []);
      setStats(statsData);
      setActivity(activityData);
    } catch {
      console.error("Gagal load data");
    }
    setIsLoadingData(false);
  }

  async function handleLogin() {
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuth(true);
        loadData();
      } else {
        const data = await res.json();
        setLoginError(data.error || "Password salah.");
      }
    } catch {
      setLoginError("Gagal koneksi ke server.");
    }
    setIsLoggingIn(false);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuth(false);
    setUsers([]);
    setStats(null);
  }

  async function handleAddUser() {
    setFormError("");
    setFormSuccess("");
    setIsSubmitting(true);

    const duration = form.useCustom ? form.customDuration : form.duration;

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          access_code: form.access_code,
          duration_months: duration,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFormSuccess(
          "User '" +
            form.username +
            "' berhasil ditambahkan! Code: " +
            form.access_code,
        );
        setForm({
          username: "",
          access_code: generateCode(),
          duration: "1",
          customDuration: "",
          useCustom: false,
        });
        loadData();
      } else {
        setFormError(data.error || "Gagal tambah user.");
      }
    } catch {
      setFormError("Gagal koneksi ke server.");
    }
    setIsSubmitting(false);
  }

  async function handleUserAction(username: string, action: string) {
    setActionLoading(username + "_" + action);
    try {
      const res = await fetch("/api/admin/users/" + username, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        loadData();
      } else {
        const data = await res.json();
        alert("Gagal: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Gagal koneksi ke server.");
    }
    setActionLoading("");
  }

  // ===== LOADING STATE =====
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Memuat...</div>
      </div>
    );
  }

  // ===== LOGIN FORM =====
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-[#131722] border border-yellow-400/30 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center mx-auto mb-3">
                <span className="text-black font-bold text-xl">G</span>
              </div>
              <h1 className="text-xl font-bold text-yellow-400">
                GoldLQ Admin
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Masukkan password untuk akses
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                placeholder="Password admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 rounded-lg bg-[#0a0e1a] border border-[#1e222d] text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400/50 text-sm"
              />

              {loginError && (
                <p className="text-xs text-red-400">{loginError}</p>
              )}

              <button
                onClick={handleLogin}
                disabled={isLoggingIn || !password}
                className="w-full py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm transition"
              >
                {isLoggingIn ? "Memverifikasi..." : "Masuk"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== DASHBOARD =====
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Header */}
      <header className="border-b border-[#1e222d] bg-[#131722]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
              <span className="text-black font-bold text-sm">G</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-yellow-400">
                GoldLQ Admin
              </h1>
              <p className="text-xs text-gray-500">Dashboard Manajemen</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-400 transition px-3 py-1.5 rounded-lg border border-[#1e222d] hover:border-red-400/30"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
        {/* ===== F7-A: USER SEGERA EXPIRED ===== */}
        {(() => {
          const expiringSoon = users.filter((u) => {
            const days = Math.ceil(
              (new Date(u.expires_at).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            );
            return days >= 0 && days <= 7 && u.is_active;
          });
          if (expiringSoon.length === 0) return null;
          return (
            <div>
              <h2 className="text-sm font-semibold text-orange-400 mb-3">
                ⚠️ Segera Expired ({expiringSoon.length} user)
              </h2>
              <div className="space-y-2">
                {expiringSoon.map((user) => {
                  const daysLeft = Math.ceil(
                    (new Date(user.expires_at).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24),
                  );
                  return (
                    <div
                      key={user.id}
                      className="bg-orange-500/5 border border-orange-500/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">⏰</span>
                        <div>
                          <span className="font-mono font-semibold text-orange-300 text-sm">
                            {user.username}
                          </span>
                          <p className="text-xs text-gray-500">
                            Expired dalam{" "}
                            <span className="text-orange-400 font-semibold">
                              {daysLeft} hari
                            </span>{" "}
                            · {user.upload_count}/{user.upload_limit} upload
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleUserAction(user.username, "extend")
                        }
                        disabled={!!actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 text-xs font-semibold transition disabled:opacity-50"
                      >
                        {actionLoading === user.username + "_extend"
                          ? "..."
                          : "+1 Bulan"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ===== STATISTIK ===== */}
        {stats && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-3">
              📊 Statistik
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: "User Aktif",
                  value: stats.users.active,
                  sub: "dari " + stats.users.total + " total",
                  color: "text-yellow-400",
                },
                {
                  label: "Upload User",
                  value: stats.users.totalUploads,
                  sub: "total semua user",
                  color: "text-yellow-400",
                },
                {
                  label: "Trial Aktif",
                  value: stats.trials.active,
                  sub: stats.trials.completed + " sudah selesai",
                  color: "text-blue-400",
                },
                {
                  label: "Upload Trial",
                  value: stats.trials.totalUploads,
                  sub: "dari " + stats.trials.total + " visitor",
                  color: "text-blue-400",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-[#131722] border border-[#1e222d] rounded-xl p-4"
                >
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className={"text-2xl font-bold " + s.color}>{s.value}</p>
                  <p className="text-xs text-gray-600 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== F7-B: SUMBER TRAFFIC ===== */}
        {activity && activity.sources.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-3">
              🌐 Sumber Trial
            </h2>
            <div className="bg-[#131722] border border-[#1e222d] rounded-2xl p-5">
              <div className="space-y-2.5">
                {activity.sources.map(([src, count]) => {
                  const total = activity.sources.reduce((s, [, c]) => s + c, 0);
                  const pct = Math.round((count / total) * 100);
                  const srcIcon =
                    src === "tiktok"
                      ? "🎵"
                      : src === "instagram"
                        ? "📸"
                        : src === "whatsapp"
                          ? "💬"
                          : src === "telegram"
                            ? "✈️"
                            : "🌿";
                  return (
                    <div key={src} className="flex items-center gap-3">
                      <span className="text-base w-5">{srcIcon}</span>
                      <span className="text-xs text-gray-400 w-20 capitalize">
                        {src}
                      </span>
                      <div className="flex-1 bg-[#0a0e1a] rounded-full h-2">
                        <div
                          className="h-2 bg-blue-500/60 rounded-full"
                          style={{ width: pct + "%" }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-12 text-right">
                        {count}x ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== F7-C: AKTIVITAS 7 HARI ===== */}
        {activity && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-3">
              📈 Aktivitas 7 Hari Terakhir
            </h2>
            <div className="bg-[#131722] border border-[#1e222d] rounded-2xl p-5">
              {/* Legend */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-blue-500/60" />
                  <span className="text-xs text-gray-500">Trial baru</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-yellow-400/60" />
                  <span className="text-xs text-gray-500">User baru</span>
                </div>
              </div>

              {/* Chart */}
              <div className="flex items-end justify-between gap-1.5 h-24">
                {activity.dates.map((date, i) => {
                  const maxVal = Math.max(
                    ...activity.trials,
                    ...activity.users,
                    1,
                  );
                  const trialH = Math.round((activity.trials[i] / maxVal) * 96);
                  const userH = Math.round((activity.users[i] / maxVal) * 96);
                  return (
                    <div
                      key={date}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div className="w-full flex items-end justify-center gap-0.5 h-20">
                        {/* Trial bar */}
                        <div
                          className="flex-1 bg-blue-500/50 hover:bg-blue-500/70 rounded-t transition-all"
                          style={{ height: trialH + "px" }}
                          title={"Trial: " + activity.trials[i]}
                        />
                        {/* User bar */}
                        <div
                          className="flex-1 bg-yellow-400/50 hover:bg-yellow-400/70 rounded-t transition-all"
                          style={{ height: userH + "px" }}
                          title={"User: " + activity.users[i]}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {getDayLabel(date)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Numbers */}
              <div className="grid grid-cols-7 gap-1 mt-2">
                {activity.dates.map((date, i) => (
                  <div key={date} className="text-center">
                    {activity.trials[i] > 0 && (
                      <p className="text-xs text-blue-400">
                        {activity.trials[i]}
                      </p>
                    )}
                    {activity.users[i] > 0 && (
                      <p className="text-xs text-yellow-400">
                        {activity.users[i]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== TAMBAH USER ===== */}
        <div className="bg-[#131722] border border-yellow-400/20 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-yellow-400 mb-4">
            ➕ Tambah User Baru
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Username
              </label>
              <input
                type="text"
                placeholder="contoh: trader_andi"
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value.toLowerCase().replace(/\s/g, "_"),
                  })
                }
                className="w-full px-3 py-2.5 rounded-lg bg-[#0a0e1a] border border-[#1e222d] text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400/50 text-sm"
              />
            </div>

            {/* Access Code */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Access Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.access_code}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      access_code: e.target.value.toUpperCase(),
                    })
                  }
                  className="flex-1 px-3 py-2.5 rounded-lg bg-[#0a0e1a] border border-[#1e222d] text-white font-mono text-sm focus:outline-none focus:border-yellow-400/50"
                />
                <button
                  onClick={() =>
                    setForm({ ...form, access_code: generateCode() })
                  }
                  className="px-3 py-2.5 rounded-lg bg-[#1e222d] hover:bg-[#2a2f3e] text-gray-300 text-xs transition"
                  title="Generate ulang"
                >
                  🔀
                </button>
              </div>
            </div>

            {/* Durasi */}
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">
                Durasi Langganan
              </label>
              <div className="flex gap-2 flex-wrap">
                {!form.useCustom ? (
                  <>
                    <select
                      value={form.duration}
                      onChange={(e) =>
                        setForm({ ...form, duration: e.target.value })
                      }
                      className="px-3 py-2.5 rounded-lg bg-[#0a0e1a] border border-[#1e222d] text-white text-sm focus:outline-none focus:border-yellow-400/50"
                    >
                      <option value="1">1 bulan</option>
                      <option value="3">3 bulan</option>
                      <option value="6">6 bulan</option>
                    </select>
                    <button
                      onClick={() => setForm({ ...form, useCustom: true })}
                      className="px-3 py-2.5 rounded-lg bg-[#1e222d] hover:bg-[#2a2f3e] text-gray-400 text-xs transition"
                    >
                      Ketik manual
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Jumlah bulan"
                        value={form.customDuration}
                        onChange={(e) =>
                          setForm({ ...form, customDuration: e.target.value })
                        }
                        className="w-36 px-3 py-2.5 rounded-lg bg-[#0a0e1a] border border-[#1e222d] text-white text-sm focus:outline-none focus:border-yellow-400/50"
                      />
                      <span className="text-gray-400 text-sm">bulan</span>
                    </div>
                    <button
                      onClick={() =>
                        setForm({
                          ...form,
                          useCustom: false,
                          customDuration: "",
                        })
                      }
                      className="px-3 py-2.5 rounded-lg bg-[#1e222d] hover:bg-[#2a2f3e] text-gray-400 text-xs transition"
                    >
                      Pakai dropdown
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {formError && (
            <p className="text-xs text-red-400 mt-3">{formError}</p>
          )}
          {formSuccess && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-400">✅ {formSuccess}</p>
            </div>
          )}

          <button
            onClick={handleAddUser}
            disabled={isSubmitting || !form.access_code}
            className="mt-4 px-6 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm transition"
          >
            {isSubmitting ? "Menyimpan..." : "Tambah User"}
          </button>
        </div>

        {/* ===== DAFTAR USER ===== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400">
              👥 Daftar User ({users.length})
            </h2>
            <button
              onClick={loadData}
              disabled={isLoadingData}
              className="text-xs text-gray-500 hover:text-yellow-400 transition"
            >
              {isLoadingData ? "Memuat..." : "🔄 Refresh"}
            </button>
          </div>

          {users.length === 0 ? (
            <div className="bg-[#131722] border border-[#1e222d] rounded-2xl p-8 text-center">
              <p className="text-gray-500 text-sm">Belum ada user terdaftar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const expired = isExpired(user.expires_at);
                const isActive = user.is_active && !expired;
                return (
                  <div
                    key={user.id}
                    className={
                      "bg-[#131722] border rounded-xl p-4 " +
                      (isActive
                        ? "border-[#1e222d]"
                        : "border-red-500/20 opacity-75")
                    }
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      {/* Info user */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono font-semibold text-yellow-400 text-sm">
                            {user.username}
                          </span>
                          <span
                            className={
                              "text-xs px-2 py-0.5 rounded-full " +
                              (isActive
                                ? "bg-green-500/10 text-green-400 border border-green-500/30"
                                : "bg-red-500/10 text-red-400 border border-red-500/30")
                            }
                          >
                            {isActive
                              ? "✅ Aktif"
                              : expired
                                ? "⏰ Expired"
                                : "❌ Nonaktif"}
                          </span>
                        </div>
                        <div className="flex gap-4 flex-wrap">
                          <span className="text-xs text-gray-500">
                            Code:{" "}
                            <span className="text-gray-300 font-mono">
                              {user.access_code}
                            </span>
                          </span>
                          <span className="text-xs text-gray-500">
                            Upload:{" "}
                            <span className="text-gray-300">
                              {user.upload_count}/{user.upload_limit}
                            </span>
                          </span>
                          <span
                            className={
                              "text-xs " +
                              (expired ? "text-red-400" : "text-gray-500")
                            }
                          >
                            Exp:{" "}
                            <span
                              className={
                                expired
                                  ? "text-red-400 font-semibold"
                                  : "text-gray-300"
                              }
                            >
                              {formatDate(user.expires_at)}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Tombol aksi */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() =>
                            handleUserAction(user.username, "extend")
                          }
                          disabled={!!actionLoading}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs transition disabled:opacity-50"
                          title="Perpanjang +1 bulan"
                        >
                          {actionLoading === user.username + "_extend"
                            ? "..."
                            : "+1 Bln"}
                        </button>
                        <button
                          onClick={() =>
                            handleUserAction(user.username, "reset_quota")
                          }
                          disabled={!!actionLoading}
                          className="px-3 py-1.5 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 text-xs transition disabled:opacity-50"
                          title="Reset kuota upload ke 0"
                        >
                          {actionLoading === user.username + "_reset_quota"
                            ? "..."
                            : "Reset Kuota"}
                        </button>
                        <button
                          onClick={() =>
                            handleUserAction(user.username, "toggle_active")
                          }
                          disabled={!!actionLoading}
                          className={
                            "px-3 py-1.5 rounded-lg text-xs transition disabled:opacity-50 border " +
                            (user.is_active
                              ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400"
                              : "bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400")
                          }
                          title={user.is_active ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {actionLoading === user.username + "_toggle_active"
                            ? "..."
                            : user.is_active
                              ? "Nonaktifkan"
                              : "Aktifkan"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
