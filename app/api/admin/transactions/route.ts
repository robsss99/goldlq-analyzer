import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("goldlq_admin")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;
  return !!adminPassword && adminCookie === adminPassword;
}

export async function GET(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // format: "2026-06"

  let query = supabaseAdmin
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (month) {
    const [year, m] = month.split("-");
    const start = year + "-" + m + "-01";
    const end = new Date(parseInt(year), parseInt(m), 0)
      .toISOString()
      .split("T")[0];
    query = query.gte("date", start).lte("date", end);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: "Gagal ambil transaksi." },
      { status: 500 },
    );
  }
  return NextResponse.json({ transactions: data || [] });
}

export async function POST(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, amount, description, category, username, date, notes } =
      await request.json();

    if (!type || !amount || !description || !date) {
      return NextResponse.json(
        { error: "Tipe, nominal, keterangan, dan tanggal wajib diisi." },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .insert({
        type,
        amount: parseInt(amount),
        description,
        category,
        username,
        date,
        notes,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Gagal simpan transaksi: " + error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true, transaction: data });
  } catch {
    return NextResponse.json(
      { error: "Gagal simpan transaksi." },
      { status: 500 },
    );
  }
}
