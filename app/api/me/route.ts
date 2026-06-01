import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const username = cookieStore.get("goldlq_session")?.value;
    const trialId = cookieStore.get("goldlq_trial")?.value;

    // ===== Cek user login dulu =====
    if (username) {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("username, upload_count, upload_limit, expires_at, is_active")
        .eq("username", username)
        .single();

      if (user) {
        const isExpired = new Date(user.expires_at) < new Date();
        const isQuotaDone = user.upload_count >= user.upload_limit;

        return NextResponse.json({
          status: "user",
          username: user.username,
          used: user.upload_count,
          limit: user.upload_limit,
          remaining: Math.max(0, user.upload_limit - user.upload_count),
          expiresAt: user.expires_at,
          isActive: user.is_active,
          isExpired: isExpired,
          isQuotaDone: isQuotaDone,
          canAnalyze: user.is_active && !isExpired && !isQuotaDone,
        });
      }
      // Cookie login ada tapi user nggak ketemu di DB → fallback ke trial
    }

    // ===== Cek trial =====
    if (trialId) {
      const { data: trial } = await supabaseAdmin
        .from("trials")
        .select("upload_count, trial_limit")
        .eq("trial_id", trialId)
        .single();

      if (trial) {
        const isTrialDone = trial.upload_count >= trial.trial_limit;
        return NextResponse.json({
          status: "trial",
          used: trial.upload_count,
          limit: trial.trial_limit,
          remaining: Math.max(0, trial.trial_limit - trial.upload_count),
          isTrialDone: isTrialDone,
          canAnalyze: !isTrialDone,
        });
      }
    }

    // ===== Pengunjung baru (belum ada cookie apapun) =====
    return NextResponse.json({
      status: "new",
      used: 0,
      limit: 5,
      remaining: 5,
      canAnalyze: true,
    });
  } catch (error) {
    console.error("Error in /api/me:", error);
    return NextResponse.json(
      { error: "Gagal mengambil status pengguna" },
      { status: 500 },
    );
  }
}
