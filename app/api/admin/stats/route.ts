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

  const { data: users } = await supabaseAdmin
    .from("users")
    .select("is_active, expires_at, upload_count");

  const { data: trials } = await supabaseAdmin
    .from("trials")
    .select("upload_count, trial_limit");

  const now = new Date();

  // Statistik user berbayar
  const totalUsers = users?.length || 0;
  const activeUsers =
    users?.filter((u) => u.is_active && new Date(u.expires_at) > now).length ||
    0;
  const totalUserUploads =
    users?.reduce((sum, u) => sum + u.upload_count, 0) || 0;

  // Statistik trial
  const totalTrials = trials?.length || 0;
  const activeTrials =
    trials?.filter((t) => t.upload_count < t.trial_limit).length || 0;
  const completedTrials =
    trials?.filter((t) => t.upload_count >= t.trial_limit).length || 0;
  const totalTrialUploads =
    trials?.reduce((sum, t) => sum + t.upload_count, 0) || 0;

  return NextResponse.json({
    users: {
      total: totalUsers,
      active: activeUsers,
      totalUploads: totalUserUploads,
    },
    trials: {
      total: totalTrials,
      active: activeTrials,
      completed: completedTrials,
      totalUploads: totalTrialUploads,
    },
  });
}
