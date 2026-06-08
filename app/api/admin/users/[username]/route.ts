import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("goldlq_admin")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;
  return !!adminPassword && adminCookie === adminPassword;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action } = await request.json();
    const { username } = await params;

    // Perpanjang +1 bulan
    if (action === "extend") {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("expires_at")
        .eq("username", username)
        .single();

      if (!user) {
        return NextResponse.json(
          { error: "User tidak ditemukan." },
          { status: 404 },
        );
      }

      // Extend dari expires_at sekarang (atau dari hari ini kalau udah expired)
      const currentExpiry = new Date(user.expires_at);
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      baseDate.setMonth(baseDate.getMonth() + 1);

      const { error } = await supabaseAdmin
        .from("users")
        .update({ expires_at: baseDate.toISOString(), is_active: true })
        .eq("username", username);

      if (error) throw error;
      return NextResponse.json({
        success: true,
        newExpiresAt: baseDate.toISOString(),
      });
    }

    // Toggle aktif/nonaktif
    if (action === "toggle_active") {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("is_active")
        .eq("username", username)
        .single();

      if (!user) {
        return NextResponse.json(
          { error: "User tidak ditemukan." },
          { status: 404 },
        );
      }

      const { error } = await supabaseAdmin
        .from("users")
        .update({ is_active: !user.is_active })
        .eq("username", username);

      if (error) throw error;
      return NextResponse.json({ success: true, isActive: !user.is_active });
    }

    // Reset kuota upload
    if (action === "reset_quota") {
      const { error } = await supabaseAdmin
        .from("users")
        .update({ upload_count: 0 })
        .eq("username", username);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action tidak valid." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Gagal update user." }, { status: 500 });
  }
}
