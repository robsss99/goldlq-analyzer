// lib/getBiasContext.ts
// Helper untuk ambil bias terbaru dari cache, lalu format jadi konteks
// untuk disuntik ke prompt Claude Vision di /api/analyze.

import { supabaseAdmin } from "@/lib/supabase";

export interface BiasContextResult {
  hasBias: boolean;
  ageHours: number | null;
  contextText: string; // siap ditempel ke prompt; "" kalau tidak ada
  raw: any | null;
}

/**
 * Ambil bias terbaru dari bias_cache.
 * Tidak pernah throw — kalau gagal, balikin hasil kosong supaya
 * analisa LQ tetap jalan normal tanpa bias.
 */
export async function getBiasContext(): Promise<BiasContextResult> {
  const empty: BiasContextResult = { hasBias: false, ageHours: null, contextText: "", raw: null };
  try {
    const { data, error } = await supabaseAdmin
      .from("bias_cache")
      .select("bias_data, generated_at")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data?.bias_data) return empty;

    const b = data.bias_data;
    const ageMs = Date.now() - new Date(data.generated_at).getTime();
    const ageHours = Math.round((ageMs / (1000 * 60 * 60)) * 10) / 10;

    // Kalau bias terlalu tua (>24 jam), jangan dipakai — bisa menyesatkan
    if (ageHours > 24) return empty;

    // Format konteks ringkas untuk prompt Vision
    const supports = (b.supports_bias || [])
      .map((c: any) => `- ${c.theme}: ${c.explanation}`)
      .join("\n");
    const flips = (b.flips_bias || [])
      .map((c: any) => `- ${c.theme}: ${c.explanation}`)
      .join("\n");

    const contextText = `
=== KONTEKS FUNDAMENTAL HARI INI (XAUUSD Daily Bias, ${ageHours} jam lalu) ===
Day Bias: ${b.bias} (confidence ${b.confidence}%)
Swing Bias: ${b.swing_bias}
Headline: ${b.headline}
Safe-Haven Demand: ${b.safe_haven_demand} | USD: ${b.usd_pressure} | Fed: ${b.fed_stance}

Key Levels (fundamental): Target ${b.key_levels?.target} | Pullback ${b.key_levels?.pullback} | Invalidation ${b.key_levels?.invalidation}

Yang mendukung bias:
${supports}

Yang bisa membalik bias:
${flips}

INSTRUKSI: Pertimbangkan konteks fundamental ini saat menilai setup teknikal LQ.
- Jika arah setup LQ SEARAH dengan Day Bias di atas, naikkan keyakinan (confluence).
- Jika setup LQ BERLAWANAN dengan bias fundamental, beri peringatan eksplisit di bagian warnings bahwa setup melawan bias makro hari ini.
- Sebutkan secara singkat keselarasan/konflik ini di bagian reasoning.
=== AKHIR KONTEKS FUNDAMENTAL ===
`.trim();

    return { hasBias: true, ageHours, contextText, raw: b };
  } catch {
    return empty;
  }
}
