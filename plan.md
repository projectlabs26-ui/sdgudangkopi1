# 🏫 SD Gudang Kopi 1 - Website & PWA Absensi

> Website resmi sekolah sekaligus aplikasi PWA absensi guru berbasis geolokasi & selfie.

**Domain:** `sdgudangkopi1.my.id`  
**Tech Stack:** Next.js 14 (App Router) + Supabase + Tailwind CSS  
**Status:** Planning Phase

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [User Roles](#user-roles)
4. [Database Schema](#database-schema)
5. [Pages & Routes](#pages--routes)
6. [Features](#features)
7. [UI/UX Design](#uiux-design)
8. [PWA Configuration](#pwa-configuration)
9. [Deployment](#deployment)

---

## 1. Overview

### Visi Proyek
Membangun website resmi SD Gudang Kopi 1 yang berfungsi sebagai:
- **Website profil sekolah** — informasi, berita, pengumuman
- **PWA absensi guru** — absensi berbasis geolokasi & selfie
- **Dashboard admin** — manajemen data & monitoring kehadiran

### Target Pengguna
- 👑 Kepala Sekolah — monitoring & laporan
- 🔧 Admin/TU — manajemen data
- 👨‍🏫 Guru — absensi harian
- 🎒 Siswa/Orang Tua — *(Phase 2)*
- 👥 Masyarakat umum — informasi sekolah

---

## 2. Architecture

### High-Level Architecture

```
sdgudangkopi1.my.id
│
├── 🌐 FRONTEND (Next.js 14 - Vercel)
│   ├── App Router (Server Components + Client Components)
│   ├── Tailwind CSS (Responsive Design)
│   ├── Supabase Client (Auth + DB + Storage)
│   └── Service Worker (PWA + Offline)
│
├── ⚙️ BACKEND (Supabase)
│   ├── Supabase Auth (Email + Password)
│   ├── Supabase Database (PostgreSQL + RLS)
│   ├── Supabase Storage (Selfie photos + Media)
│   └── Supabase Realtime (Live updates)
│
└── 📱 PWA
    ├── Manifest (Installable)
    ├── Service Worker (Offline shell)
    └── Push Notifications
```

### Tech Stack Detail

| Komponen | Teknologi | Keterangan |
|----------|-----------|------------|
| Framework | Next.js 14 | App Router, Server Components |
| Styling | Tailwind CSS | Utility-first, responsive |
| Database | Supabase (PostgreSQL) | Managed, auto-backup |
| Auth | Supabase Auth | Email + Password |
| Storage | Supabase Storage | Selfie photos, media |
| Realtime | Supabase Realtime | Live dashboard |
| Hosting | Vercel | Auto-deploy from Git |
| PWA | next-pwa | Service worker, manifest |
| QR Code | html5-qrcode | Scan QR (Phase 2) |

---

## 3. User Roles

### Hierarki Role

```
👑 Kepala Sekolah (Highest)
│   Full access: config, rekap, laporan, user management
│
├── 🔧 Admin / TU
│   Manajemen data: guru, siswa, kelas, berita
│   Absensi manual (jika guru lupa)
│   Rekap & export laporan
│
├── 👨‍🏫 Guru
│   Absen sendiri (geolokasi + selfie)
│   Lihat rekap pribadi
│   (Phase 2) Absensi siswa
│
└── 🎒 Siswa (Phase 2)
    Lihat rekap kehadiran
```

### Role Definitions

| Role | Code | Description |
|------|------|-------------|
| Kepala Sekolah | `kepala_sekolah` | Pimpinan sekolah, akses penuh |
| Admin | `admin` | Tata usaha, manajemen data |
| Guru | `guru` | Tenaga pengajar, absensi pribadi |
| Siswa | `siswa` | Murid, rekap kehadiran *(Phase 2)* |

---

## 4. Database Schema

### ERD (Entity Relationship Diagram)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │────<│  teachers   │────<│teacher_cls  │
│             │     │             │     │             │
│ id (PK/FK) │     │ id (PK)    │     │ id (PK)    │
│ email       │     │ user_id(FK)│     │teacher_id  │
│ full_name   │     │ subject    │     │ class_id   │
│ role        │     │ photo_url  │     │ subject    │
│ phone       │     │ bio        │     └──────┬──────┘
│ avatar_url  │     │ display_order│           │
│ is_active   │     └─────────────┘           │
└──────┬──────┘                               │
       │                                      │
       │          ┌─────────────┐     ┌───────┴──────┐
       │          │  attendances│     │   classes    │
       │          │             │     │              │
       └─────────>│ id (PK)    │     │ id (PK)     │
                  │ user_id(FK)│     │ grade_id(FK)│
                  │ date        │     │ name        │
                  │ clock_in    │     │ teacher_id  │
                  │ clock_out   │     │ acad_year   │
                  │ status      │     └───────┬─────┘
                  └─────────────┘             │
                                              │
                       ┌─────────────┐  ┌─────┴──────┐
                       │   grades    │  │  students  │
                       │             │  │            │
                       │ id (PK)    │  │ id (PK)   │
                       │ level       │  │ class_id  │
                       │ name        │  │ full_name │
                       └─────────────┘  │ nis       │
                                        └────────────┘

┌──────────────┐     ┌──────────────┐
│school_profile│     │     news     │
│              │     │              │
│ id (PK)     │     │ id (PK)     │
│ school_name  │     │ title        │
│ latitude     │     │ slug         │
│ longitude    │     │ content      │
│ radius       │     │ category     │
│ clock_in/out │     │ image_url    │
└──────────────┘     └──────────────┘
```

### Table: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guru',
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `grades`

```sql
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level INT NOT NULL UNIQUE,  -- 1, 2, 3, 4, 5, 6
  name TEXT NOT NULL           -- "Kelas 1", "Kelas 2", dst
);
```

### Table: `classes`

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grade_id UUID REFERENCES grades(id),
  name TEXT NOT NULL,          -- "1A", "1B", "2A", "2B", dst
  teacher_id UUID REFERENCES users(id),  -- wali kelas
  academic_year TEXT DEFAULT '2025/2026',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `teachers`

```sql
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE,
  subject TEXT,                -- "Matematika", "PJOK", dst
  photo_url TEXT,
  bio TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);
```

### Table: `teacher_classes`

```sql
CREATE TABLE teacher_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id),
  class_id UUID REFERENCES classes(id),
  subject TEXT,
  UNIQUE(teacher_id, class_id, subject)
);
```

### Table: `students`

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  nis TEXT UNIQUE,              -- nomor induk siswa
  nisn TEXT,                    -- nomor induk nasional siswa
  class_id UUID REFERENCES classes(id),
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `attendances`

```sql
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Absen Masuk
  clock_in TIMESTAMPTZ,
  clock_in_lat DECIMAL(10, 8),
  clock_in_long DECIMAL(11, 8),
  clock_in_selfie_url TEXT,
  clock_in_status TEXT,  -- 'tepat_waktu' | 'terlambat'

  -- Absen Keluar
  clock_out TIMESTAMPTZ,
  clock_out_lat DECIMAL(10, 8),
  clock_out_long DECIMAL(11, 8),
  clock_out_selfie_url TEXT,

  -- Status
  status TEXT DEFAULT 'hadir',
  -- 'hadir' | 'terlambat' | 'sakit' | 'izin' | 'alpa'

  note TEXT,
  proof_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);
```

### Table: `school_profile`

```sql
CREATE TABLE school_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Info Profil
  school_name TEXT NOT NULL,
  slogan TEXT,
  vision TEXT,
  mission TEXT,
  history TEXT,

  -- Kontak
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,

  -- Media
  logo_url TEXT,
  banner_url TEXT,

  -- Kepala Sekolah
  kepsek_photo_url TEXT,
  kepsek_welcome TEXT,

  -- Lokasi & Absensi
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  radius_meters INT DEFAULT 100,

  -- Jam Kerja
  clock_in_start TIME DEFAULT '07:00',
  clock_in_end TIME DEFAULT '08:30',
  clock_out_start TIME DEFAULT '14:00',
  clock_out_end TIME DEFAULT '16:00',
  late_tolerance_minutes INT DEFAULT 15,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `news`

```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'pengumuman',
  -- 'pengumuman' | 'berita' | 'kegiatan'
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Pages & Routes

### Public Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing Page | Profil sekolah, hero, visi-misi |
| `/berita` | Berita | Daftar berita & pengumuman |
| `/berita/[slug]` | Detail Berita | Artikel lengkap |
| `/guru` | Daftar Guru | Foto & profil guru |
| `/kontak` | Kontak | Alamat, telepon, Google Maps |

### Auth Pages (Guru)

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Email + Password |
| `/absen` | Dashboard Guru | Status hari ini, tombol absen |
| `/absen/scan` | Absen | Geolokasi + selfie capture |
| `/absen/success` | Berhasil | Konfirmasi absen berhasil |
| `/rekap` | Rekap Pribadi | Kalender + statistik |
| `/profile` | Profil Guru | Edit profil |

### Admin Pages

| Route | Page | Description |
|-------|------|-------------|
| `/admin/dashboard` | Dashboard | Ringkasan hari ini |
| `/admin/config` | Konfigurasi | Lokasi, jam, radius |
| `/admin/teachers` | Kelola Guru | CRUD guru |
| `/admin/classes` | Kelola Kelas | CRUD kelas & siswa |
| `/admin/berita` | Kelola Berita | CRUD berita |
| `/admin/attendance` | Rekap Guru | Lihat semua absensi |

### Kepala Sekolah Pages

| Route | Page | Description |
|-------|------|-------------|
| `/kepsek/dashboard` | Dashboard | Monitoring semua guru |
| `/kepsek/rekap` | Rekap | Rekap mingguan/bulanan |
| `/kepsek/laporan` | Laporan | Export PDF/Excel |

---

## 6. Features

### Phase 1 (MVP)

#### 🌐 Landing Page
- Profil sekolah (nama, visi, misi, sejarah)
- Berita & pengumuman terbaru
- Daftar guru dengan foto
- Kontak & lokasi (Google Maps)
- Responsive design

#### 🔐 Authentication
- Login email + password (Supabase Auth)
- Auto redirect berdasarkan role
- Session management

#### 📍 Absensi Guru
- Geolokasi GPS (cek radius sekolah) — koordinat dari DB, validasi backend
- Selfie capture (kamera depan)
- Timestamp otomatis
- Status: tepat waktu / terlambat
- Absen masuk & absen keluar
- **Self-report sakit & izin** (upload bukti gambar, tanpa geolokasi)

#### 📊 Rekap Kehadiran
- Kalender bulanan
- Statistik: hadir, sakit, izin, alpa, terlambat
- Persentase kehadiran

#### ⚙️ Admin Panel
- Dashboard ringkasan
- Kelola guru (CRUD + toggle aktif)
- Kelola kelas & siswa
- Kelola berita
- **Konfigurasi lengkap** (logo, banner, sejarah, visi, misi, kontak, GPS, jam kerja, radius, foto kepsek, sambutan)
- Rekap semua guru
- Absensi manual (guru & kepala sekolah)

### Phase 2 (Future)

#### 🎒 Siswa
- Absensi siswa (QR code / manual oleh guru)
- Dashboard orang tua
- Notifikasi push ke orang tua

#### 📱 Advanced
- Export laporan PDF/Excel
- Notifikasi push (guru & orang tua)
- Multi bahasa
- Dark mode

---

## 7. UI/UX Design

### Design System

#### Warna

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Primary | Biru Sekolah | `#2563EB` | Buttons, links, navbar |
| Secondary | Hijau Sukses | `#16A34A` | Success states, hadir |
| Accent | Kuning Ceria | `#EAB308` | Highlights, warnings |
| Danger | Merah Error | `#DC2626` | Error states, alpa |
| Background | Putih Bersih | `#FFFFFF` | Main background |
| Surface | Abu Muda | `#F3F4F6` | Cards, sections |
| Text | Abu Gelap | `#1F2937` | Primary text |
| Text Light | Abu Terang | `#6B7280` | Secondary text |

#### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 | Poppins | Bold (700) | 36px |
| H2 | Poppins | SemiBold (600) | 28px |
| H3 | Poppins | SemiBold (600) | 22px |
| Body | Inter | Regular (400) | 16px |
| Small | Inter | Regular (400) | 14px |

#### Spacing & Layout

- Max width: `1280px`
- Card border radius: `12px`
- Button border radius: `8px`
- Section padding: `64px` (desktop) / `32px` (mobile)

### Wireframe: Landing Page

```
┌─────────────────────────────────────────────────────┐
│  [Logo] SD Gudang Kopi 1    Berita  Guru  Kontak    │
│                                          [Login 🔑] │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ╔═══════════════════════════════════════════════╗  │
│  ║  🏫 SD Gudang Kopi 1                         ║  │
│  ║  "Mencerdaskan Generasi Bangsa"              ║  │
│  ║                                               ║  │
│  ║  [Lihat Pengumuman]    [Login Guru]           ║  │
│  ╚═══════════════════════════════════════════════╝  │
│                                                      │
├─────────────────────────────────────────────────────┤
│  📢 BERITA & PENGUMUMAN                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  [Image] │ │  [Image] │ │  [Image] │            │
│  │  Title 1 │ │  Title 2 │ │  Title 3 │            │
│  │  ...     │ │  ...     │ │  ...     │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                      │
├─────────────────────────────────────────────────────┤
│  👨‍🏫 VISI & MISI                                     │
│  ┌─────────────────────┬─────────────────────┐      │
│  │ VISI                │ MISI                │      │
│  │ "Menjadi sekolah    │ 1. Meningkatkan     │      │
│  │  unggul dalam..."   │    kualitas..."     │      │
│  │                     │ 2. Mengembangkan... │      │
│  └─────────────────────┴─────────────────────┘      │
│                                                      │
├─────────────────────────────────────────────────────┤
│  👨‍🏫 DAFTAR GURU                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │
│  │ 📷  │ │ 📷  │ │ 📷  │ │ 📷  │ │ 📷  │         │
│  │Guru │ │Guru │ │Guru │ │Guru │ │Guru │         │
│  │  1  │ │  2  │ │  3  │ │  4  │ │  5  │         │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘         │
│                                                      │
├─────────────────────────────────────────────────────┤
│  📍 KONTAK & LOKASI                                  │
│  Alamat: Jl. xxx, Kota xxx                         │
│  Telp: 0812xxxxx                                    │
│  [Google Maps Embed]                                │
│                                                      │
├─────────────────────────────────────────────────────┤
│  FOOTER: © 2026 SD Gudang Kopi 1                   │
└─────────────────────────────────────────────────────┘
```

### Wireframe: Halaman Absen Guru

```
┌─────────────────────────────────────────────────────┐
│  ← SD Gudang Kopi 1        [Logout]                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📅 Senin, 19 Agustus 2026                          │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │         📷 Live Preview (Kamera)              │  │
│  │                                               │  │
│  │           ┌─────────────┐                     │  │
│  │           │   👤 You    │                     │  │
│  │           │   (Selfie)  │                     │  │
│  │           └─────────────┘                     │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  📍 Lokasi: SD Gudang Kopi 1                        │
│  ✅ Dalam radius (45m dari pusat)                    │
│                                                      │
│  ⏰ Jam Sekarang: 07:15 WIB                         │
│  📋 Jam Masuk: 07:00 - 08:30                        │
│  ✅ Status: TEPAT WAKTU                              │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │           📸 ABSEN SEKARANG                   │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  ─────────────────────────────────────────────────── │
│                                                      │
│  Riwayat Hari Ini:                                   │
│  ✅ Masuk: 07:15 WIB                                │
│  ⏳ Belum absen keluar                               │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 8. PWA Configuration

### Manifest

```json
{
  "name": "SD Gudang Kopi 1",
  "short_name": "SDGK1",
  "description": "Website & Absensi SD Gudang Kopi 1",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563EB",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Features
- ✅ Installable (Add to Home Screen)
- ✅ Offline shell (cached pages)
- ✅ Fast loading (cached assets)
- ⏳ Push notifications (Phase 2)

---

## 9. Deployment

### Environment

| Environment | URL | Branch |
|-------------|-----|--------|
| Development | `localhost:3000` | `main` |
| Production | `sdgudangkopi1.my.id` | `main` |

### Deployment Steps

1. **Supabase**
   - Create project
   - Run SQL migrations
   - Configure RLS policies
   - Setup Storage buckets

2. **Vercel**
   - Connect GitHub repo
   - Set environment variables
   - Configure custom domain
   - Enable HTTPS

3. **Domain**
   - Point DNS to Vercel
   - Configure SSL certificate

---

### Migration Files

| File | Keterangan |
|------|------------|
| `001_initial_schema.sql` | Schema utama: semua tabel, RLS, storage buckets, indexes |
| `002_fix_rls_policies.sql` | Fix: tambah policy INSERT/UPDATE/DELETE untuk admin |
| `003_add_proof_image.sql` | Tambah kolom `proof_image_url` untuk self-report sakit/izin |

## 📝 Notes

- **Phase 1:** Fokus guru absensi + landing page
- **Phase 2:** Tambah siswa + notifikasi
- **Selfie storage:** 1 tahun + backup
- **Cutoff time:** Admin-configurable
- **Radius GPS:** Default 100m (configurable)
