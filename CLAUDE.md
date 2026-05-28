# 📋 GOLDLQ ANALYZER — FILE SERAH-TERIMA (HANDOFF)

> **Cara pakai:** Paste seluruh isi file ini di awal chat baru dengan Claude. Ini berisi semua konteks supaya lanjutan kerja tidak meleset.

---

## 👤 TENTANG SAYA (Robsss)

- Trader emas (XAUUSD) & content creator, brand **@360tradersss**, basis di Indonesia.
- Komunikasi pakai **Bahasa Indonesia**, register santai “aku/kamu”.
- Pemula web development (background MQL5). Belajar sambil praktik, suka dipandu pelan-pelan langkah demi langkah, dengan penjelasan “kenapa”-nya.
- Sering kirim screenshot (monitor MSI / kamera HP) untuk verifikasi.

---

## 🎯 PROYEK: GoldLQ Analyzer

Web app AI yang menganalisa screenshot chart MT5 (emas/XAUUSD) pakai Claude Vision dengan teknik **LQ (Liquidity Quartile)** = (H+L+O+C)/4. Output: setup trading (Entry/SL/TP/RR) dalam Bahasa Indonesia.

### Tech Stack

- **Next.js 16.2.4** + TypeScript + Tailwind CSS v4 + App Router + Turbopack
- **Anthropic SDK** (model: `claude-sonnet-4-5`)
- **Supabase** (database PostgreSQL, region Seoul)
- **Vercel** (hosting, auto-deploy dari GitHub)

### Resource Penting (VERBATIM)

- Local: `D:\Projects\goldlq-analyzer`
- GitHub: `https://github.com/robsss99/goldlq-analyzer` (Public)
- Production: `https://goldlq-analyzer.vercel.app`
- Supabase URL: `https://pdnvjonjqohopsiditaz.supabase.co`
- GitHub user: `robsss99` | Email: `robhisaputra99@gmail.com`
- OS: Windows (CMD syntax: `dir`, `rmdir /s /q`, `mkdir`)
- YouTube tutorial (Shorts): video ID `jTeFEymeuz4`

### ⚠️ STRUKTUR PROYEK PENTING

- `tsconfig.json` → `"paths": { "@/*": ["./*"] }` = **STRUKTUR FLAT, TANPA folder src/**
- Semua folder (app/, components/, lib/) di **ROOT**. `@/lib/supabase` = `./lib/supabase`
- Case-sensitivity: folder huruf kecil (Windows case-insensitive, Vercel/Linux case-sensitive!)

### Kebiasaan Teknis (lesson learned)

- **JANGAN pakai template literal** untuk className dinamis (sering korup saat copy-paste) → pakai **string concatenation `+`**.
- JSX: butuh **1 parent** atau Fragment `<>...</>`. Fragment pembuka cukup `<>` (BUKAN `<></>`).
- Habis ubah `.env.local` → **WAJIB restart server** (`Ctrl+C` lalu `npm run dev`).
- **JANGAN** `npm audit fix --force` (bisa rusak project).
- Workflow deploy: edit → save → `npm run dev` test → `git add .` → `git commit -m "..."` → `git push origin main` → tunggu Vercel → hard refresh (Ctrl+Shift+R).

---

## 💰 MODEL BISNIS (sudah diputuskan)

- **Freemium**: trial gratis → lanjut bayar.
- Harga: **Rp 150.000/bulan**.
- Limit: **150 upload** per user, masa aktif **1 bulan**.
- Trial: **5x upload tanpa login** (BELUM dibuat — Fase E).
- Biaya AI: ~$0,02/analisa. Margin sehat (67-84%).
- Pembayaran: **MANUAL dulu** (user transfer → admin aktifkan manual di Supabase). Payment gateway nanti kalau sudah rame.

---

## ✅ FITUR YANG SUDAH SELESAI & LIVE

### 1. Tutorial Video di Pro Tip (DONE, live)

- Tombol “🎬 Lihat Video Tutorial Penggunaan” di section Pro Tip (`components/UploadSection.tsx`), buka `TutorialModal`.
- Pakai Fragment `<>...</>` di return UploadSection.

### 2. Kompres Gambar Otomatis (DONE, live)

Di `components/UploadSection.tsx`:

- File ≤ 3MB → kirim apa adanya.
- File 3-5MB → kompres (Canvas, resize max width 1568px, quality 0.85) + tampilkan **warning kuning** (“File terlalu besar — dikompres otomatis… mungkin kurang akurat… gunakan screenshot langsung dengan header OHLC jelas”).
- File > 5MB → ditolak (“Ukuran file maksimal 5MB”).
- State terkait: `wasCompressed`. Fungsi: `compressImage()`, dipanggil di `handleFile` (yang sudah jadi `async`).
- `validateFile`: maxSize = 5MB.

---

## 🔐 STATUS AUTH (SEDANG DIKERJAKAN)

### Arsitektur yang Diputuskan

- Login: **username + access-code** (BUKAN username-only — demi keamanan biaya AI).
- Sesi: **cookie httpOnly** bernama `goldlq_session` (isi: username), masa 7 hari. (BUKAN localStorage — demi keamanan produk berbayar).
- User didaftarkan **MANUAL** oleh admin via Supabase Table Editor.

### ✅ FASE A — DATABASE (SELESAI)

Tabel `users` di Supabase (sudah dibuat via SQL Editor):

```sql
create table users (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  access_code text not null,
  activated_at timestamptz default now(),
  expires_at timestamptz not null,
  upload_count integer default 0,
  upload_limit integer default 150,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index idx_users_username on users (username);
```

- RLS **enabled** (`alter table users enable row level security;`) — tanpa policy, jadi hanya server (secret key) yang bisa akses.
- 1 user tes sudah ada: username `robsss_test`, access_code `GOLD-TEST-1234`, expires_at 2026-06-28, limit 150, count 0, is_active true.

### ✅ FASE B — KONEKSI NEXT.JS ↔ SUPABASE (SELESAI)

- Library terinstall: `@supabase/supabase-js`.
- `.env.local` (gitignored via `.env*`) berisi 3 variabel:
  - `ANTHROPIC_API_KEY=...`
  - `NEXT_PUBLIC_SUPABASE_URL=https://pdnvjonjqohopsiditaz.supabase.co`
  - `SUPABASE_SECRET_KEY=sb_secret_...` (pakai Secret Key sistem BARU Supabase, bukan legacy service_role)
- File `lib/supabase.ts` dibuat — export `supabaseAdmin` (createClient pakai URL + SECRET_KEY, autoRefreshToken & persistSession false).
- Koneksi sudah dites & SUKSES (file tes `app/api/test-db` sudah DIHAPUS untuk keamanan).

### ✅ FASE C — HALAMAN LOGIN (SELESAI)

- `app/api/login/route.ts` — POST handler. Validasi berlapis: input kosong → user ada → access_code cocok → is_active → belum expired → kuota belum habis → set cookie `goldlq_session` (httpOnly, secure di production, sameSite lax, maxAge 7 hari). Pesan “username atau code salah” sengaja sama (anti-enumeration).
- `app/login/page.tsx` — halaman login `"use client"`, form username + accessCode, tema dark+gold senada app (#0a0e1a / #131722 / yellow-400), redirect ke `/` kalau sukses pakai `useRouter`.
- Sudah dites: login `robsss_test`/`GOLD-TEST-1234` → SUKSES redirect ke homepage, cookie terpasang. ✅

---

## 👉 FASE D — PROTEKSI SERVER-SIDE (BELUM MULAI — INI LANGKAH BERIKUTNYA)

**Tujuan:** Lindungi `app/api/analyze/route.ts` supaya Claude hanya dipanggil kalau user valid. Ini JANTUNG keamanan biaya AI.

**Rencana gerbang pemeriksaan SEBELUM panggil Claude:**

1. Baca cookie `goldlq_session` → siapa user? (nggak ada → tolak)
1. Cari user di Supabase (nggak ada → tolak)
1. Cek `is_active` (nonaktif → tolak)
1. Cek `expires_at` (expired → tolak)
1. Cek `upload_count < upload_limit` (kuota habis → tolak)
1. ✅ Lolos → panggil Claude
1. Sukses → `upload_count + 1` di database

**LANGKAH PERTAMA Fase D:** Claude perlu LIHAT isi `app/api/analyze/route.ts` saat ini dulu (imports, parsing FormData/gambar, bagian panggil Claude) sebelum menyisipkan proteksi — supaya tidak merusak logika analisa yang sudah jalan.

---

## ⏳ FASE E — TRIAL MODE (BELUM, setelah Fase D)

- 5x upload tanpa login (untuk pengunjung belum login).
- Perlu pikirkan: tracking trial (IP/browser — bisa dibypass incognito, tapi cukup untuk awal), dan alur homepage untuk 3 jenis pengunjung (paid/trial/expired).
- CATATAN: Homepage saat ini BELUM dijaga — orang belum login masih bisa akses analyzer. Ini akan ditangani bersama Fase D & E.

---

## 🗺️ RINGKASAN POSISI

```
✅ Fase A — Database
✅ Fase B — Koneksi Supabase
✅ Fase C — Login (API + halaman + cookie)
👉 Fase D — Proteksi server-side API analyze  ← LANJUT DI SINI
   Fase E — Trial mode 5x
```

**Mulai chat baru dengan:** “Lanjut Fase D proteksi server-side. Ini file handoff-nya: [paste]. Aku akan kirim screenshot isi app/api/analyze/route.ts.”
