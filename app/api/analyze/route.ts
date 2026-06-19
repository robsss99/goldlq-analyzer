import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildAnalysisPrompt } from "@/lib/prompts";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // ===== GERBANG PROTEKSI (Fase D + E) =====
    // Penanda jalur: login (user) atau trial (tanpa login)
    let isTrial = false;
    let trialId = "";

    // 1. Baca cookie sesi → siapa user-nya?
    const cookieStore = await cookies();
    const username = cookieStore.get("goldlq_session")?.value;

    if (username) {
      // ===== JALUR USER LOGIN (logika Fase D) =====
      // 2. Cari user di Supabase
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (userError || !user) {
        return NextResponse.json(
          { error: "Sesi tidak valid. Silakan login ulang." },
          { status: 401 },
        );
      }

      // 3. Cek akun aktif
      if (!user.is_active) {
        return NextResponse.json(
          { error: "Akun kamu nonaktif. Hubungi admin." },
          { status: 403 },
        );
      }

      // 4. Cek masa aktif (expired?)
      if (new Date(user.expires_at) < new Date()) {
        return NextResponse.json(
          { error: "Masa aktif kamu sudah habis. Silakan perpanjang." },
          { status: 403 },
        );
      }

      // 5. Cek kuota upload
      if (user.upload_count >= user.upload_limit) {
        return NextResponse.json(
          {
            error:
              "Kuota upload kamu sudah habis (" + user.upload_limit + "x).",
            limitReached: true,
          },
          { status: 403 },
        );
      }
    } else {
      // ===== Cek dulu: browser ini pernah punya akun? =====
      const hasAccount = cookieStore.get("goldlq_has_account")?.value === "1";
      if (hasAccount) {
        return NextResponse.json(
          {
            error:
              "Kamu sudah punya akun. Silakan login untuk lanjut menganalisa.",
            hasAccount: true,
          },
          { status: 401 },
        );
      }

      // ===== JALUR TRIAL (tanpa login) =====
      isTrial = true;
      trialId = cookieStore.get("goldlq_trial")?.value || "";

      if (trialId) {
        // Pengunjung trial lama → cek hitungannya
        const { data: trial } = await supabaseAdmin
          .from("trials")
          .select("*")
          .eq("trial_id", trialId)
          .single();

        if (trial && trial.upload_count >= trial.trial_limit) {
          return NextResponse.json(
            {
              error:
                "Jatah trial gratis kamu sudah habis (" +
                trial.trial_limit +
                "x). Silakan login atau berlangganan untuk lanjut.",
              trialEnded: true,
            },
            { status: 403 },
          );
        }
        // trial belum ada di DB / masih ada sisa → lolos, lanjut
      }
      // Kalau belum ada trialId sama sekali → pengunjung baru, lolos (dibuat nanti setelah sukses)
    }

    // ===== LOLOS — lanjut ke analisa =====

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const timeframe = (formData.get("timeframe") as string) || "D1";
    const tradingStyle = (formData.get("tradingStyle") as string) || "swing";

    if (!file) {
      return NextResponse.json(
        { error: "File gambar tidak ditemukan" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File harus berupa gambar (PNG/JPG)" },
        { status: 400 },
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 10MB" },
        { status: 400 },
      );
    }

    console.log("Received analysis request:");
    console.log("  File: " + file.name + " (" + file.size + " bytes)");
    console.log("  Timeframe: " + timeframe);
    console.log("  Trading Style: " + tradingStyle);

    console.log("Converting image to base64...");
    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");
    const mediaType = file.type as
      | "image/png"
      | "image/jpeg"
      | "image/gif"
      | "image/webp";

    const prompt = buildAnalysisPrompt(timeframe, tradingStyle);

    console.log("Calling Claude Vision API...");
    const startTime = Date.now();

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("Claude responded in " + duration + "s");

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    if (!responseText) {
      throw new Error("Claude tidak mengembalikan response text");
    }

    console.log("Parsing analysis result...");
    let analysisData;
    try {
      const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      analysisData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.log("Raw response:", responseText);
      throw new Error("Format response AI tidak valid");
    }

    const processingTimeStr = duration + "s";

    // ===== Sukses → tambah hitungan upload (user ATAU trial) =====
    let newCount = 0;
    let newLimit = 0;

    if (isTrial) {
      // Jalur trial: catat/naikkan hitungan di tabel trials
      if (trialId) {
        // Trial lama → naikkan hitungannya
        const { data: existingTrial } = await supabaseAdmin
          .from("trials")
          .select("upload_count, trial_limit")
          .eq("trial_id", trialId)
          .single();

        const currentCount = existingTrial ? existingTrial.upload_count : 0;
        newCount = currentCount + 1;
        newLimit = existingTrial ? existingTrial.trial_limit : 5;

        await supabaseAdmin.from("trials").upsert(
          {
            trial_id: trialId,
            upload_count: newCount,
            last_used_at: new Date().toISOString(),
          },
          { onConflict: "trial_id" },
        );
        console.log("Trial upload naik:", currentCount, "->", newCount);
      } else {
        // Pengunjung trial BARU → bikin trialId baru, hitungan = 1
        trialId = crypto.randomUUID();
        const utmSource = (formData.get("utm_source") as string) || null;
        const { data: newTrial } = await supabaseAdmin
          .from("trials")
          .insert({ trial_id: trialId, upload_count: 1, source: utmSource })
          .select("upload_count, trial_limit")
          .single();

        newCount = 1;
        newLimit = newTrial ? newTrial.trial_limit : 5;
        console.log("Trial baru dibuat:", trialId);
      }
    } else {
      // Jalur user login: naikkan upload_count di tabel users
      const { data: u } = await supabaseAdmin
        .from("users")
        .select("upload_count")
        .eq("username", username)
        .single();

      if (u) {
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({ upload_count: u.upload_count + 1 })
          .eq("username", username);

        if (updateError) {
          console.error("GAGAL update upload_count:", updateError);
        } else {
          console.log("upload_count naik (+1)");
        }
      }
    }
    // Ambil sisa kuota user terbaru (kalau jalur user login) buat dikirim ke frontend
    let userInfo = null;
    if (!isTrial) {
      const { data: u2 } = await supabaseAdmin
        .from("users")
        .select("upload_count, upload_limit")
        .eq("username", username)
        .single();
      if (u2) {
        userInfo = {
          used: u2.upload_count,
          limit: u2.upload_limit,
          remaining: Math.max(0, u2.upload_limit - u2.upload_count),
        };
      }
    }

    const response = NextResponse.json({
      success: true,
      analysis: analysisData,
      metadata: {
        timeframe: timeframe,
        tradingStyle: tradingStyle,
        processingTime: processingTimeStr,
        model: "claude-sonnet-4-5",
        timestamp: new Date().toISOString(),
      },
      // Info trial buat frontend (cuma terisi kalau pengunjung trial)
      trial: isTrial
        ? {
            used: newCount,
            limit: newLimit,
            remaining: newLimit - newCount,
          }
        : null,
      // Info user buat frontend (cuma terisi kalau jalur user login)
      user: userInfo,
    });

    // Set cookie trial (cuma kalau jalur trial)
    if (isTrial && trialId) {
      response.cookies.set("goldlq_trial", trialId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 hari
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Error in analyze API:", error);

    if (error instanceof Anthropic.APIError) {
      const isRateLimit = error.status === 429 || error.status === 529;
      return NextResponse.json(
        {
          error: isRateLimit
            ? "GoldLq sedang maintenance. Coba beberapa saat lagi."
            : "GoldLq mengalami gangguan teknis. Hubungi Admin.",
          details: error.message,
        },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Gagal memproses analisa",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
