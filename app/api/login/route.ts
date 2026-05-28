import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body.username || "").trim();
    const accessCode = (body.accessCode || "").trim();

    // Validasi input kosong
    if (!username || !accessCode) {
      return NextResponse.json(
        { success: false, message: "Username dan access code wajib diisi" },
        { status: 400 },
      );
    }

    // Cari user di database
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    // User tidak ditemukan
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: "Username atau access code salah" },
        { status: 401 },
      );
    }

    // Cek access code
    if (user.access_code !== accessCode) {
      return NextResponse.json(
        { success: false, message: "Username atau access code salah" },
        { status: 401 },
      );
    }

    // Cek status aktif
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, message: "Akun nonaktif. Hubungi admin." },
        { status: 403 },
      );
    }

    // Cek masa berlaku
    const now = new Date();
    const expiresAt = new Date(user.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Masa langganan habis. Silakan perpanjang.",
        },
        { status: 403 },
      );
    }

    // Cek kuota
    if (user.upload_count >= user.upload_limit) {
      return NextResponse.json(
        { success: false, message: "Kuota upload habis." },
        { status: 403 },
      );
    }

    // SEMUA LOLOS → login berhasil
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        username: user.username,
        uploadCount: user.upload_count,
        uploadLimit: user.upload_limit,
        expiresAt: user.expires_at,
      },
    });

    // Pasang cookie httpOnly (gelang tiket)
    response.cookies.set("goldlq_session", user.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan", error: String(err) },
      { status: 500 },
    );
  }
}
