import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Sudah dihitung hari ini? Skip
    const alreadyCounted = cookieStore.get("goldlq_visit_today")?.value;
    if (alreadyCounted) {
      return NextResponse.json({ counted: false });
    }

    // Hitung kunjungan hari ini
    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabaseAdmin
      .from("page_views")
      .select("id, visitor_count")
      .eq("date", today)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("page_views")
        .update({ visitor_count: existing.visitor_count + 1 })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin
        .from("page_views")
        .insert({ date: today, visitor_count: 1 });
    }

    // Set cookie sampai tengah malam biar nggak dobel hitung
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999);
    const secondsLeft = Math.floor((midnight.getTime() - now.getTime()) / 1000);

    const response = NextResponse.json({ counted: true });
    response.cookies.set("goldlq_visit_today", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: secondsLeft,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Track visit error:", error);
    return NextResponse.json({ counted: false });
  }
}
