# 📋 TODO - SD Gudang Kopi 1

> Checklist untuk pengembangan Website & PWA Absensi

---

## ✅ Phase 0: Setup & Planning

- [x] Diskusi konsep & fitur
- [x] Tentukan tech stack (Next.js + Supabase)
- [x] Buat plan.md
- [x] Buat todo.md
- [x] Buat .env.local template

---

## 🏗️ Phase 1: Setup Project

### Setup Awal

- [x] `npx create-next-app@latest` dengan App Router
- [x] Install dependencies:
  - [x] `@supabase/supabase-js`
  - [x] `@supabase/ssr`
  - [x] `tailwindcss`
  - [x] `next-pwa`
  - [x] `lucide-react` (icons)
  - [x] `date-fns` (date formatting)
  - [x] `react-hot-toast` (notifications)
  - [x] `sharp` (icon generation)
  - [x] `xlsx` (export Excel)
- [x] Setup folder structure
- [x] Configure Tailwind CSS
- [x] Setup ESLint & Prettier

### Supabase Setup

- [x] Buat Supabase project
- [x] Run SQL migrations:
  - [x] Table `users`
  - [x] Table `grades`
  - [x] Table `classes`
  - [x] Table `teachers`
  - [x] Table `teacher_classes`
  - [x] Table `students`
  - [x] Table `attendances`
  - [x] Table `school_profile` (incl. `kepsek_photo_url`, `kepsek_welcome`)
  - [x] Table `news`
- [x] Setup Row Level Security (RLS) — ada di migration SQL
- [x] Create Storage buckets (avatars, selfies, news-images, school-media)
- [x] Get API keys & URL — sudah di `.env.local`

### Auth Setup

- [x] Create Supabase client utilities (`server.ts`, `client.ts`)
- [x] Create auth middleware (`middleware.ts`, `lib/middleware.ts`)
- [x] Implement login page (`/login`)
- [x] Implement auth callback (`/auth/callback/route.ts`)
- [x] Role-based redirect logic (kepsek → /kepsek/dashboard, admin → /admin/dashboard, guru → /absen)

---

## 🌐 Phase 2: Landing Page

### Public Pages

- [x] **Layout**: Navbar + Footer
- [x] **Homepage (`/`)**
  - [x] Hero section (nama sekolah, slogan, CTA)
  - [x] Berita & pengumuman section
  - [x] Visi & Misi section
  - [x] Daftar guru section
  - [x] Kepala Sekolah section (sambutan + foto)
  - [x] Kontak & lokasi section
  - [x] Google Maps embed
- [x] **Berita (`/berita`)**
  - [x] Daftar berita (card grid)
  - [x] Filter by category
  - [x] Pagination
- [x] **Detail Berita (`/berita/[slug]`)**
  - [x] Artikel content
  - [x] Share button
- [x] **Daftar Guru (`/guru`)**
  - [x] Grid guru dengan foto
  - [x] Profil singkat
- [x] **Kontak (`/kontak`)**
  - [x] Alamat, telepon, email
  - [x] Google Maps

### Responsive Design

- [x] Mobile-first approach (Tailwind responsive classes)
- [x] Tablet breakpoint
- [x] Desktop breakpoint
- [ ] Test semua halaman (real device)

---

## 👨‍🏫 Phase 3: Guru Features

### Auth & Dashboard

- [x] **Login (`/login`)**
  - [x] Form email + password
  - [x] Error handling
  - [x] Redirect to `/absen`
- [x] **Dashboard Guru (`/absen`)**
  - [x] Status hari ini (belum absen / sudah absen)
  - [x] Tombol "Absen Sekarang"
  - [x] Riwayat hari ini (masuk & keluar)

### Absensi

- [x] **Halaman Absen (`/absen/scan`)**
  - [x] Request geolocation permission
  - [x] Cek apakah dalam radius
  - [x] Tampilkan jarak dari pusat
  - [x] Buka kamera selfie
  - [x] Capture foto
  - [x] Kirim ke Supabase Storage
  - [x] Simpan record attendance
- [x] **Konfirmasi (`/absen/success`)**
  - [x] Tampilkan detail absensi
  - [x] Tampilkan lokasi & waktu
  - [x] Status: tepat waktu / terlambat
- [x] **Self-Report Sakit & Izin**
  - [x] Tombol "Sakit" & "Izin" di dashboard
  - [x] Form dengan upload bukti gambar (surat dokter)
  - [x] API endpoint `/api/attendance/report`
  - [x] Kolom `proof_image_url` di tabel attendances
  - [x] Tidak perlu geolocation (bisa dari mana saja)

### Rekap

- [x] **Rekap Pribadi (`/rekap`)**
  - [x] Kalender bulanan
  - [x] Statistik: hadir, sakit, izin, alpa
  - [x] Persentase kehadiran
  - [x] Filter bulan

### Profil

- [x] **Profil Guru (`/profile`)**
  - [x] Lihat profil
  - [x] Edit nama, telepon, mata pelajaran, bio
  - [x] Upload/ganti foto profil
  - [x] Ganti password

---

## ⚙️ Phase 4: Admin Features

### Dashboard

- [x] **Dashboard (`/admin/dashboard`)**
  - [x] Ringkasan hari ini
  - [x] Jumlah guru hadir/absen
  - [x] Quick links

### Kelola Guru

- [x] **Daftar Guru (`/admin/teachers`)**
  - [x] Grid guru dengan foto
  - [x] Search & filter
  - [x] Tombol tambah guru
- [x] **Tambah/Edit Guru**
  - [x] Form: nama, email, password, mata pelajaran
  - [x] Upload foto
- [x] **Hapus/Nonaktifkan Guru**
  - [x] Toggle aktif/nonaktif (Power icon)
  - [x] Filter status (Semua/Aktif/Nonaktif)
  - [x] Badge status di kartu guru
  - [x] Informasi jumlah guru aktif & nonaktif

### Kelola Kelas & Siswa

- [x] **Daftar Kelas (`/admin/classes`)**
  - [x] Tabel kelas (nama, wali kelas, jumlah siswa)
  - [x] Tambah kelas
  - [x] Edit kelas
- [x] **Daftar Siswa (`/admin/students`)**
  - [x] Tabel siswa per kelas
  - [x] Tambah/edit siswa
  - [x] Import CSV
  - [x] Export CSV

### Kelola Berita

- [x] **Daftar Berita (`/admin/berita`)**
  - [x] Tabel berita
  - [x] Tambah berita
  - [x] Edit berita (slug auto-generate)
  - [x] Publish/unpublish
  - [x] Hapus berita

### Konfigurasi

- [x] **Konfigurasi Sekolah (`/admin/config`)**
  - [x] Profil sekolah (nama, visi, misi)
  - [x] Logo & banner upload
  - [x] Sejarah sekolah
  - [x] Alamat & kontak
  - [x] Koordinat GPS
  - [x] Radius toleransi (meter)
  - [x] Jam masuk (start & end)
  - [x] Jam keluar (start & end)
  - [x] Toleransi keterlambatan (menit)
  - [x] Foto & sambutan kepala sekolah
  - [x] Export data (absensi, guru, siswa) ke Excel

### Rekap & Laporan

- [x] **Rekap Semua Guru (`/admin/attendance`)**
  - [x] Tabel absensi semua guru
  - [x] Filter: tanggal, guru, status
  - [x] Export CSV

### Absensi Manual

- [x] Fitur input absensi manual oleh admin
- [x] Pilih guru & tanggal
- [x] Set status (hadir/sakit/izin/alpa)
- [x] Tambah catatan

---

## 👑 Phase 5: Kepala Sekolah

### Dashboard

- [x] **Dashboard (`/kepsek/dashboard`)**
  - [x] Monitoring semua guru
  - [x] Statistik kehadiran
  - [x] Quick links

### Rekap & Laporan

- [x] **Rekap (`/kepsek/rekap`)**
  - [x] Rekap mingguan
  - [x] Rekap bulanan
  - [x] Perbandingan antar guru
  - [x] Tren grafik harian
  - [x] Perbandingan bulan sebelumnya
- [x] **Laporan (`/kepsek/laporan`)**
  - [x] Custom date range
  - [x] Quick select (bulan ini, 7 hari, 30 hari, dll)
  - [x] Export CSV
  - [x] Cetak laporan

---

## 📱 Phase 6: PWA

### Setup

- [x] Install & configure `next-pwa`
- [x] Create manifest.json
- [x] Create icons (192x192, 512x512) — generated from logo.png via sharp
- [x] Configure service worker
- [x] Fix next.config.mjs (runtime caching, disable in dev)

### Features

- [x] Offline shell
- [x] Cache assets (images, CSS/JS, API, Supabase storage)
- [ ] Install prompt
- [ ] Push notifications (Phase 2)

### Testing

- [ ] Lighthouse audit (score > 90)
- [ ] Test install di Android
- [ ] Test install di iOS
- [ ] Test offline mode

---

## 🚀 Phase 7: Deployment

### Pre-deployment

- [ ] Environment variables ready
- [ ] SQL migrations complete (jalankan di Supabase SQL Editor)
- [ ] RLS policies configured
- [ ] Storage buckets created

### Deploy

- [ ] Push to GitHub
- [ ] Connect Vercel
- [ ] Set environment variables di Vercel
- [ ] Configure custom domain
- [ ] Test production build

### Post-deployment

- [ ] Test login (semua role)
- [ ] Test absensi
- [ ] Test landing page
- [ ] Test PWA install
- [ ] Monitor errors

---

## 🧪 Testing Checklist

### Auth

- [ ] Login berhasil (guru)
- [ ] Login berhasil (admin)
- [ ] Login berhasil (kepala sekolah)
- [ ] Login gagal (password salah)
- [ ] Redirect berdasarkan role
- [ ] Logout berhasil
- [ ] Session expired handling

### Absensi

- [ ] Geolocation permission
- [ ] Cek radius (dalam)
- [ ] Cek radius (luar) → error
- [ ] Selfie capture
- [ ] Upload foto ke storage
- [ ] Simpan attendance record
- [ ] Status tepat waktu
- [ ] Status terlambat
- [ ] Absen masuk
- [ ] Absen keluar
- [ ] Duplicate absen hari ini → handled

### Landing Page

- [ ] Load cepat (<3 detik)
- [ ] Responsive mobile
- [ ] Responsive tablet
- [ ] Responsive desktop
- [ ] Berita tampil
- [ ] Guru tampil
- [ ] Maps load

### Admin

- [ ] CRUD guru
- [ ] CRUD kelas
- [ ] CRUD siswa
- [ ] CRUD berita
- [ ] Update konfigurasi
- [ ] Lihat rekap
- [ ] Absensi manual

### PWA

- [ ] Install prompt muncul
- [ ] Bisa install
- [ ] Offline mode
- [ ] Icon benar

---

## 📝 Catatan

- **Prioritas:** Landing page + Guru absensi dulu
- **Phase 2:** Siswa + Notifikasi
- **Selfie:** Disimpan 1 tahun
- **Domain:** sdgudangkopi1.my.id
- **Hosting:** Vercel (gratis)
- **Database:** Supabase (gratis tier)

---

## 🔄 Update Log

| Tanggal | Update |
|---------|--------|
| 19 Agustus 2026 | Initial planning, buat plan.md & todo.md |
| 19 Agustus 2026 | Buat halaman publik: /berita, /berita/[slug], /guru, /kontak |
| 19 Agustus 2026 | Buat halaman /profile untuk guru (edit profil, foto, ganti password) |
| 19 Agustus 2026 | Buat CRUD Siswa (/admin/students) + Import/Export CSV |
| 19 Agustus 2026 | Buat /kepsek/rekap (tren, perbandingan guru) + /kepsek/laporan (custom date range, export, cetak) |
| 19 Agustus 2026 | Tambah toggle aktif/nonaktif guru + filter status di admin/teachers |
| 19 Agustus 2026 | Konfigurasi PWA: next-pwa, service worker, runtime caching, offline support |
| 19 Agustus 2026 | **Sesi lanjutan:** Buat /auth/callback route, generate icon PWA (192, 512) dari logo, rewrite useCamera hook, buat /absen/scan & /absen/success, fix next.config.mjs (PWA caching), tambah kolom kepsek_photo_url & kepsek_welcome ke migration, hapus .next cache, install sharp, verifikasi seluruh halaman 200 OK |
| 19 Agustus 2026 | **Sesi sore:** Cek koneksi Supabase, fix role admin (kepala_sekolah→admin), buat teacher record untuk Sima Aulia, fix RLS policies (002_fix_rls_policies.sql: tambah policy INSERT/UPDATE/DELETE untuk admin di teachers, users, classes, students, teacher_classes, attendances) |
| 19 Agustus 2026 | **Sesi malam:** Fitur self-report sakit/izin + upload bukti gambar (003_add_proof_image.sql, /api/attendance/report, tombol Sakit & Izin di /absen), perbaikan geolocation (fetch koordinat dari DB di /absen & /absen/scan, validasi backend di /api/attendance), tambah Logo + Banner + Sejarah di /admin/config, bersihkan file temporary |