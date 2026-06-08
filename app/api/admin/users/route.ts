import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("goldlq_admin")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;
  return !!adminPassword && adminCookie === adminPassword;
}

// GET — ambil semua user
export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Gagal ambil data users." },
      { status: 500 },
    );
  }

  return NextResponse.json({ users });
}

// POST — tambah user baru
export async function POST(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username, access_code, duration_months } = await request.json();

    if (!username || !access_code || !duration_months) {
      return NextResponse.json(
        { error: "Username, access code, dan durasi wajib diisi." },
        { status: 400 },
      );
    }

    const months = parseInt(duration_months);
    if (isNaN(months) || months < 1) {
      return NextResponse.json(
        { error: "Durasi tidak valid." },
        { status: 400 },
      );
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        username: username.trim().toLowerCase(),
        access_code: access_code.trim().toUpperCase(),
        expires_at: expiresAt.toISOString(),
        upload_count: 0,
        upload_limit: 150,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Username sudah digunakan." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "Gagal tambah user: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, user: data });
  } catch {
    return NextResponse.json({ error: "Gagal tambah user." }, { status: 500 });
  }
}
