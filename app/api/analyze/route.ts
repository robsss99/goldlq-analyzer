import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildAnalysisPrompt } from "@/lib/prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
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

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      metadata: {
        timeframe: timeframe,
        tradingStyle: tradingStyle,
        processingTime: processingTimeStr,
        model: "claude-sonnet-4-5",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in analyze API:", error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        {
          error: "AI service error",
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
