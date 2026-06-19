import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("goldlq_admin")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;
  return !!adminPassword && adminCookie === adminPassword;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await supabaseAdmin
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Gagal hapus transaksi." },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}
