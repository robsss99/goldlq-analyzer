import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("goldlq_admin")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;
  return !!adminPassword && adminCookie === adminPassword;
}

export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Buat array 7 hari terakhir
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }

  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const [{ data: recentTrials }, { data: recentUsers }] = await Promise.all([
    supabaseAdmin
      .from("trials")
      .select("created_at, source")
      .gte("created_at", since.toISOString()),
    supabaseAdmin
      .from("users")
      .select("created_at")
      .gte("created_at", since.toISOString()),
  ]);

  // Hitung per tanggal
  const trialsByDate: Record<string, number> = {};
  const usersByDate: Record<string, number> = {};
  dates.forEach((d) => {
    trialsByDate[d] = 0;
    usersByDate[d] = 0;
  });

  recentTrials?.forEach((t) => {
    const d = t.created_at.split("T")[0];
    if (d in trialsByDate) trialsByDate[d]++;
  });
  recentUsers?.forEach((u) => {
    const d = u.created_at.split("T")[0];
    if (d in usersByDate) usersByDate[d]++;
  });

  // Source breakdown (semua waktu)
  const { data: allTrials } = await supabaseAdmin
    .from("trials")
    .select("source");

  const sourceCounts: Record<string, number> = {};
  allTrials?.forEach((t) => {
    const src = t.source || "organik";
    // Ambil utm_source saja (sebelum underscore pertama)
    const srcLabel = src.split("_")[0];
    sourceCounts[srcLabel] = (sourceCounts[srcLabel] || 0) + 1;
  });

  const sources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return NextResponse.json({
    dates,
    trials: dates.map((d) => trialsByDate[d]),
    users: dates.map((d) => usersByDate[d]),
    sources,
  });
}
