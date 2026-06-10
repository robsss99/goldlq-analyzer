import Link from "next/link";

export default function BerlanggananPage() {
  return (
    <main className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Header */}
      <header className="border-b border-[#1e222d] bg-[#131722]/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <span className="text-black font-bold text-xl">G</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-gold">
                GoldLQ Analyzer
              </h1>
              <p className="text-xs text-gray-400">
                AI-Powered XAU/USD Analysis
              </p>
            </div>
          </Link>
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-yellow-400 transition px-3 py-1.5 rounded-lg border border-[#1e222d] hover:border-yellow-400/30"
          >
            ← Kembali ke Analyzer
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 md:py-16 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-6">
          <span className="text-sm text-yellow-400 font-medium">
            🔑 Dapatkan Akses Penuh
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Mulai Analisa Chart Gold{" "}
          <span className="text-gradient-gold">Seperti Pro Trader</span>
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto text-base md:text-lg">
          Akses GoldLQ Analyzer secara penuh — analisa unlimited dengan teknik{" "}
          <span className="text-yellow-400 font-semibold">
            LQ (Liquidity Quartile)
          </span>{" "}
          + Smart Money Concept.
        </p>
      </section>

      {/* Fitur yang didapat */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-3xl mx-auto bg-[#131722] border border-yellow-400/20 rounded-2xl p-6 md:p-8">
          <h3 className="text-lg font-semibold text-yellow-400 mb-5">
            ✨ Yang kamu dapatkan:
          </h3>

          {/* Daily Bias Feature — Full width highlight */}
          <div className="w-full mb-5 p-4 rounded-xl bg-linear-to-r from-yellow-400/10 to-orange-400/5 border border-yellow-400/40">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xl">⚡</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 font-semibold">
                    EKSKLUSIF
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Daily Bias XAUUSD — Fundamental Analyzer
                  </h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  1 klik baca semua analisa makro emas hari ini: arah bias
                  harian (BEARISH/BULLISH), sentimen Fed, tekanan DXY, Safe
                  Haven index, Swing & Day bias — lengkap dengan cluster faktor
                  pendukung, key levels, dan konteks berita terkini. Nggak perlu
                  buka banyak tab lagi.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                icon: "🤖",
                text: "Analisa chart XAUUSD dengan AI profesional 360tradersss",
              },
              {
                icon: "💎",
                text: "Teknik LQ (Liquidity Quartile) eksklusif andalan @360tradersss",
              },
              {
                icon: "🎯",
                text: "Setup lengkap: Entry Zone, SL, TP1/TP2/TP3 + R:R ratio, Reason Entry",
              },
              {
                icon: "📋",
                text: "Playbook skenario jika TP tercapai & jika SL terkena",
              },
              {
                icon: "🏗️",
                text: "Analisa struktur: trend, bias, candle pattern, key levels. Lengkap banget!",
              },
              {
                icon: "⏰",
                text: "Hasil analisa dalam hitungan detik (~20 detik). Lebih cepat dari tarik garis! 😄",
              },
              {
                icon: "📱",
                text: "Akses dari semua device (HP, laptop, tablet). Semua Chart XAUUSD bisa dianalisa!",
              },
              {
                icon: "🔄",
                text: "Biaya analisa lebih murah daripada Signal provider lain! Bahkan dari beli kopi 1 gelas ☕",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-[#0a0e1a] rounded-lg border border-[#1e222d]"
              >
                <span className="text-xl flex-shrink-0">{f.icon}</span>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara kerja */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-base font-semibold text-gray-400 text-center mb-5">
            Cara mendapatkan akses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              {
                step: "1",
                icon: "💬",
                title: "Hubungi",
                desc: "Hubungi admin atau reseller terpercaya",
              },
              {
                step: "2",
                icon: "💳",
                title: "Bayar",
                desc: "Lakukan pembayaran sesuai instruksi",
              },
              {
                step: "3",
                icon: "🔑",
                title: "Dapat Akses",
                desc: "Terima username + access code",
              },
              {
                step: "4",
                icon: "📊",
                title: "Analisa!",
                desc: "Login dan mulai analisa chart gold kamu",
              },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="bg-[#131722] border border-[#1e222d] rounded-xl p-4 text-center h-full">
                  <div className="w-7 h-7 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center mx-auto mb-2">
                    <span className="text-xs font-bold text-yellow-400">
                      {s.step}
                    </span>
                  </div>
                  <span className="text-2xl block mb-2">{s.icon}</span>
                  <p className="text-sm font-semibold text-white mb-1">
                    {s.title}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                {i < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-1.5 transform -translate-y-1/2 text-gray-600 z-10">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dua jalur */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-base font-semibold text-gray-400 text-center mb-5">
            Pilih jalur yang cocok buat kamu
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jalur Langsung */}
            <div className="bg-[#131722] border border-yellow-400/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-400">
                    Beli Langsung
                  </h4>
                  <p className="text-xs text-gray-500">
                    Langsung dari admin @360tradersss
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                Hubungi admin langsung untuk info paket, harga, dan cara
                pembayaran. Respon cepat via Telegram.
              </p>

              <div className="space-y-2">
                {/* Telegram */}
                <a
                  href="https://t.me/LQ_ANALYZER"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 transition"
                >
                  <span className="text-lg">✈️</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#229ED9]">
                      Channel Telegram
                    </p>
                    <p className="text-xs text-gray-500">GoldLQ Analyzer</p>
                  </div>
                  <span className="text-xs text-gray-600">→</span>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com/360tradersss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition"
                >
                  <span className="text-lg">📸</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-pink-400">
                      Instagram
                    </p>
                    <p className="text-xs text-gray-500">@360tradersss</p>
                  </div>
                  <span className="text-xs text-gray-600">→</span>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/639121619908"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 transition"
                >
                  <span className="text-lg">💬</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-400">
                      WhatsApp
                    </p>
                    <p className="text-xs text-gray-500">+63 912 161 9908</p>
                  </div>
                  <span className="text-xs text-gray-600">→</span>
                </a>
              </div>
            </div>

            {/* Jalur Reseller */}
            <div className="bg-[#131722] border border-[#26a69a]/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#26a69a]/10 border border-[#26a69a]/30 flex items-center justify-center">
                  <span className="text-xl">🤝</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#26a69a]">
                    Beli dari Reseller
                  </h4>
                  <p className="text-xs text-gray-500">
                    Via reseller terpercaya
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                GoldLQ Analyzer tersedia melalui jaringan reseller terpercaya
                kami. Tanya di komunitas trading kamu atau hubungi admin untuk
                info reseller terdekat.
              </p>

              <div className="p-4 bg-[#0a0e1a] rounded-xl border border-[#1e222d] mb-4">
                <p className="text-xs text-gray-500 mb-3">
                  Cara cek reseller resmi:
                </p>
                <ul className="space-y-2">
                  {[
                    "Tanya di komunitas trading kamu",
                    "DM @360tradersss untuk konfirmasi keaslian reseller",
                    "Reseller resmi selalu bisa dikonfirmasi oleh admin",
                  ].map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-gray-400"
                    >
                      <span className="text-[#26a69a] mt-0.5 flex-shrink-0">
                        ✓
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="https://t.me/tradersss_360"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-[#26a69a]/10 hover:bg-[#26a69a]/20 border border-[#26a69a]/30 text-[#26a69a] text-sm font-semibold transition"
              >
                Tanya info reseller
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e222d] bg-[#131722]/30 py-8">
        <div className="container mx-auto px-4 text-center space-y-3">
          <p className="text-xs text-gray-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-yellow-400 hover:underline">
              Login di sini
            </Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <span>⚖️</span>
            <p className="text-xs max-w-lg">
              GoldLQ Analyzer adalah alat bantu analisa, bukan financial advice.
              Trading mengandung risiko. Selalu gunakan money management yang
              tepat.
            </p>
          </div>
          <p className="text-xs text-gray-700">
            Built with 💕 by{" "}
            <span className="text-yellow-400">@360tradersss</span>
          </p>
        </div>
      </footer>
    </main>
  );
}
