import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin password belum dikonfigurasi di server." },
        { status: 500 },
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Password salah." }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set("goldlq_admin", adminPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 jam
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal login." }, { status: 500 });
  }
}
