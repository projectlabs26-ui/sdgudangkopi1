# 🗄️ Panduan Setup Supabase

> Ikuti langkah-langkah berikut untuk setup database Supabase

---

## 📋 Langkah 1: Buat Supabase Project

1. Buka https://supabase.com/dashboard
2. Login / Daftar akun
3. Klik **"New Project"**
4. Isi form:
   - **Organization**: Pilih atau buat baru
   - **Project name**: `sdgudangkopi1`
   - **Database password**: Buat password yang kuat (simpan!)
   - **Region**: `Southeast Asia (Singapore)` atau terdekat
5. Klik **"Create new project"**
6. Tunggu beberapa menit sampai project selesai dibuat

---

## 📋 Langkah 2: Dapatkan API Keys

Setelah project selesai dibuat:

1. Buka **Settings** → **API** (di sidebar kiri)
2. Copy informasi berikut:

```
Project URL: https://xxxxxxxx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Buka file `.env.local` di project dan isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## 📋 Langkah 3: Jalankan SQL Migration

1. Buka **SQL Editor** (di sidebar kiri)
2. Klik **"New query"**
3. Copy seluruh isi file `supabase/migrations/001_initial_schema.sql`
4. Paste ke SQL Editor
5. Klik **"Run"** (atau tekan `Ctrl + Enter`)
6. Tunggu sampai selesai (harusnya ada pesan sukses)

---

## 📋 Langkah 4: Enable Auth

1. Buka **Authentication** → **Providers**
2. Pastikan **Email** provider sudah enabled (default: on)
3. (Optional) Disable **Sign up** jika tidak ingin user bisa daftar sendiri:
   - Buka **Authentication** → **Providers** → **Email**
   - Uncheck **"Enable sign ups"**

---

## 📋 Langkah 5: Buat User Admin Pertama

### Cara 1: Melalui Dashboard
1. Buka **Authentication** → **Users**
2. Klik **"Add user"**
3. Isi:
   - **Email**: `admin@sdgudangkopi1.my.id`
   - **Password**: Buat password yang kuat
   - **Email Confirm**: Check ✅
4. Klik **"Create user"**

### Cara 2: Melalui SQL
Buka SQL Editor dan jalankan:

```sql
-- Buat user admin (password akan di-hash otomatis)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'admin@sdgudangkopi1.my.id',
  crypt('admin123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  ''
);

-- Update role di tabel users
UPDATE users
SET role = 'kepala_sekolah'
WHERE email = 'admin@sdgudangkopi1.my.id';
```

> ⚠️ Ganti `admin123456` dengan password yang kuat!

---

## 📋 Langkah 6: Test Koneksi

1. Jalankan project:
   ```bash
   npm run dev
   ```

2. Buka http://localhost:3000
3. Buka browser console (F12)
4. Jalankan test berikut di console:

```javascript
// Test koneksi Supabase
fetch('https://YOUR-PROJECT.supabase.co/rest/v1/users?select=*&limit=1', {
  headers: {
    'apikey': 'YOUR-ANON-KEY',
    'Authorization': 'Bearer YOUR-ANON-KEY'
  }
}).then(r => r.json()).then(console.log).catch(console.error);
```

---

## 📋 Langkah 7: Setup Storage Buckets

Storage buckets seharusnya sudah dibuat oleh migration script. Untuk memverifikasi:

1. Buka **Storage** (di sidebar kiri)
2. Pastikan ada 4 buckets:
   - `avatars` (public)
   - `selfies` (private)
   - `news-images` (public)
   - `school-media` (public)

---

## 📋 Langkah 8: Konfigurasi Absensi

Update koordinat sekolah yang sesuai:

```sql
UPDATE school_profile
SET
  latitude = -6.XXXXXXX,   -- Ganti dengan koordinat asli
  longitude = 106.XXXXXXX, -- Ganti dengan koordinat asli
  radius_meters = 100,     -- Radius toleransi (meter)
  clock_in_start = '07:00',
  clock_in_end = '08:30',
  clock_out_start = '14:00',
  clock_out_end = '16:00',
  late_tolerance_minutes = 15;
```

---

## ✅ Checklist

- [ ] Buat Supabase project
- [ ] Copy API keys ke `.env.local`
- [ ] Jalankan SQL migration
- [ ] Enable Email auth
- [ ] Buat user admin
- [ ] Test koneksi
- [ ] Verifikasi storage buckets
- [ ] Update koordinat sekolah

---

## 🐛 Troubleshooting

### Error: "relation does not exist"
- Pastikan SQL migration sudah dijalankan dengan benar

### Error: "permission denied"
- Pastikan RLS policies sudah dibuat
- Pastikan user sudah login dengan benar

### Error: "invalid API key"
- Pastikan API keys di `.env.local` sudah benar
- Restart dev server setelah mengubah `.env.local`

---

## 📚 Link Berguna

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Docs](https://supabase.com/docs)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/sql-editor)
- [Auth Guide](https://supabase.com/docs/guides/auth)
- [Storage Guide](https://supabase.com/docs/guides/storage)
