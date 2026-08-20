# Panduan Penggunaan Aplikasi Absensi
# SDN Gudang Kopi 1

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Akses Aplikasi](#2-akses-aplikasi)
3. [Panduan Guru](#3-panduan-guru)
4. [Panduan Admin](#4-panduan-admin)
5. [Panduan Kepala Sekolah](#5-panduan-kepala-sekolah)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Pendahuluan

Aplikasi Absensi SDN Gudang Kopi 1 adalah sistem presensi digital berbasis web dan PWA (Progressive Web App) yang memungkinkan guru melakukan absensi dengan selfie dan validasi lokasi GPS.

### Fitur Utama:

| Fitur | Deskripsi |
|-------|-----------|
| **Absensi Selfie + GPS** | Guru clock-in/out dengan foto selfie dan validasi lokasi |
| **Self-Report Sakit/Izin** | Guru bisa melapor sakit/izin dengan bukti foto |
| **Dashboard Monitoring** | Admin & Kepsek memantau kehadiran real-time |
| **Manajemen Data** | CRUD Guru, Kelas, Siswa, Berita |
| **Rekap & Ekspor** | Laporan kehadiran + export Excel |
| **PWA** | Bisa di-install di HP seperti aplikasi native |

---

## 2. Akses Aplikasi

### 2.1 URL Aplikasi
```
https://sdgudangkopi1.vercel.app
```

### 2.2 Install di HP (PWA)

**Android (Chrome):**
1. Buka URL di Chrome
2. Klik menu ⋮ → **Add to Home Screen** / **Tambahkan ke Layar Utama**
3. Klik **Install**

**iPhone (Safari):**
1. Buka URL di Safari
2. Klik tombol Share (kotak panah atas)
3. Pilih **Add to Home Screen** → **Add**

### 2.3 Login

| Peran | Email | Password |
|-------|-------|----------|
| Admin | `admin@sdgudangkopi1.my.id` | (dari admin) |
| Kepala Sekolah | `kepsek@sdgudangkopi1.my.id` | (dari admin) |
| Guru | `nama@email.com` | (dari admin) |

> **Catatan:** Password awal diberikan oleh Admin. Segera ganti password setelah login pertama.

---

## 3. Panduan Guru

### 3.1 Halaman Absensi (`/absen`)

Halaman utama guru untuk melakukan presensi harian.

**Tampilan:**
- Status absensi hari ini (Clock In / Clock Out / Sakit / Izin)
- Tombol aksi sesuai status saat ini
- Informasi lokasi dan jarak dari sekolah

### 3.2 Clock In (Masuk)

1. Buka halaman **Absensi** (`/absen`)
2. Pastikan **GPS/Lokasi HP menyala**
3. Klik tombol hijau **🕐 Clock In**
4. Aplikasi akan meminta izin kamera — klik **Allow/Izinkan**
5. Arahkan kamera ke wajah (posisi portrait)
6. Klik tombol kamera untuk mengambil selfie
7. Klik **Konfirmasi** untuk mengirim

**Syarat Clock In:**
- Berada dalam radius yang ditentukan dari sekolah (default: 100m)
- GPS akurat (gunakan mode High Accuracy)
- Belum clock in hari ini

### 3.3 Clock Out (Pulang)

1. Setelah clock in, tombol berubah menjadi **🔴 Clock Out**
2. Klik tombol merah tersebut
3. Ambil selfie kembali
4. Konfirmasi

### 3.4 Self-Report Sakit

Jika tidak bisa hadir karena sakit:

1. Di halaman Absensi, klik tombol **🏥 Sakit**
2. Isi form:
   - **Tanggal**: otomatis hari ini
   - **Catatan**: keterangan sakit (opsional)
   - **Bukti Foto**: upload surat dokter / foto kondisi (opsional, max 5MB)
3. Klik **Kirim Laporan**

> Tidak perlu dalam radius sekolah untuk lapor sakit.

### 3.5 Self-Report Izin

Jika tidak bisa hadir karena izin:

1. Di halaman Absensi, klik tombol **📋 Izin**
2. Isi form:
   - **Tanggal**: otomatis hari ini
   - **Catatan**: alasan izin (opsional)
   - **Bukti Foto**: upload dokumen pendukung (opsional, max 5MB)
3. Klik **Kirim Laporan**

### 3.6 Rekap Absensi (`/rekap`)

Melihat riwayat absensi pribadi:
- Kalender atau tabel kehadiran per bulan
- Status: Hadir, Sakit, Izin, Alpha
- Total statistik kehadiran

### 3.7 Profil (`/profile`)

Mengelola profil pribadi:
- Nama lengkap
- NIP (tidak bisa diubah sendiri)
- Foto profil
- Ganti password

---

## 4. Panduan Admin

Admin memiliki akses penuh ke semua fitur manajemen.

### 4.1 Dashboard Admin (`/admin/dashboard`)

Ringkasan statistik:
- Total guru, siswa, kelas
- Kehadiran hari ini (hadir/sakit/izin/alpha)
- Grafik kehadiran mingguan
- Aktivitas terbaru

### 4.2 Manajemen Guru (`/admin/teachers`)

**Menambah Guru:**
1. Klik **+ Tambah Guru**
2. Isi: Nama, NIP, Email, Password, Pilih Kelas
3. Klik **Simpan**

**Mengedit Guru:**
1. Klik ikon ✏️ pada baris guru
2. Ubah data yang diperlukan
3. Klik **Simpan**

**Menghapus Guru:**
1. Klik ikon 🗑️ pada baris guru
2. Konfirmasi penghapusan

### 4.3 Manajemen Kelas (`/admin/classes`)

**Menambah Kelas:**
1. Klik **+ Tambah Kelas**
2. Isi: Nama Kelas (contoh: "Kelas 1A"), Tingkat (1-6)
3. Klik **Simpan**

**Wali Kelas:**
- Setiap kelas bisa ditugaskan satu guru sebagai wali kelas
- Pilih dari dropdown guru yang tersedia

### 4.4 Manajemen Siswa (`/admin/students`)

**Menambah Siswa:**
1. Klik **+ Tambah Siswa**
2. Isi: NISN, Nama, Pilih Kelas, Jenis Kelamin
3. Klik **Simpan**

**Import Massal:** (coming soon)
- Upload CSV/Excel untuk menambah banyak siswa sekaligus

### 4.5 Manajemen Berita (`/admin/berita`)

**Menambah Berita:**
1. Klik **+ Tambah Berita**
2. Isi: Judul, Konten (rich text), Upload Gambar
3. Status: Draft / Published
4. Klik **Simpan**

**Tips:**
- Berita dengan status **Published** akan muncul di halaman depan
- Gunakan gambar dengan rasio 16:9 (rekomendasi: 1200×675px)

### 4.6 Konfigurasi Sekolah (`/admin/config`)

Halaman paling penting — SEMUA konten homepage diatur dari sini:

| Bagian | Pengaturan |
|--------|------------|
| **Identitas** | Nama sekolah, slogan, visi, misi, sejarah |
| **Media** | Upload logo, banner hero, foto kepsek |
| **Kontak** | Alamat, telepon, email |
| **Lokasi** | Latitude, longitude, radius absensi (meter) |
| **Jam Kerja** | Jam masuk, jam pulang, toleransi keterlambatan |
| **Sambutan** | Foto kepsek, teks sambutan |

**Cara Upload Logo/Banner:**
1. Klik area upload
2. Pilih file gambar (JPG/PNG, max 2MB)
3. Gambar akan otomatis tersimpan dan muncul di homepage

### 4.7 Rekap Absensi (`/admin/attendance`)

**Melihat Rekap:**
- Filter per tanggal, guru, kelas, status
- Tabel lengkap dengan jam masuk, jam pulang, status

**Input Manual:**
- Admin bisa mencatat kehadiran Kepala Sekolah
- Pilih kepsek dari dropdown, isi status, simpan

**Ekspor Excel:**
1. Klik tombol **📥 Export Excel**
2. File akan terdownload otomatis

---

## 5. Panduan Kepala Sekolah

Kepala Sekolah memiliki akses **monitoring** (read-only).

### 5.1 Dashboard Kepsek (`/kepsek/dashboard`)

Melihat ringkasan:
- Statistik kehadiran hari ini
- Guru yang belum absen
- Grafik tren kehadiran
- Quick stats (total guru, hadir, sakit, izin, alpha)

### 5.2 Rekap Kehadiran (`/kepsek/rekap`)

**Filter:**
- Rentang tanggal
- Per guru
- Per kelas
- Per status (hadir/sakit/izin/alpha)

**Detail:**
- Jam clock in/out
- Foto selfie
- Lokasi absensi
- Status keterlambatan

### 5.3 Laporan (`/kepsek/laporan`)

**Ekspor:**
- Export Excel rekap bulanan
- Ringkasan per guru
- Statistik kehadiran (%)

**Print:**
- Gunakan fitur print browser (Ctrl+P) untuk cetak laporan

---

## 6. Troubleshooting

### 6.1 GPS Tidak Akurat

| Masalah | Solusi |
|---------|--------|
| "Di luar radius" padahal di sekolah | Aktifkan **High Accuracy** di pengaturan lokasi HP |
| GPS tidak terdeteksi | Restart HP, pastikan GPS menyala |
| Jarak tidak sesuai | Minta Admin cek koordinat di `/admin/config` |

### 6.2 Kamera Tidak Berfungsi

| Masalah | Solusi |
|---------|--------|
| Kamera tidak muncul | Pastikan izin kamera di-allow di browser |
| Foto buram | Bersihkan lensa, pastikan pencahayaan cukup |
| Error "NotAllowedError" | Buka Settings browser → izinkan kamera |

### 6.3 Tidak Bisa Login

| Masalah | Solusi |
|---------|--------|
| "Invalid credentials" | Periksa email & password, hubungi Admin |
| Lupa password | Hubungi Admin untuk reset password |
| Halaman putih setelah login | Clear cache browser (Ctrl+Shift+Del) |

### 6.4 Aplikasi Lambat

| Masalah | Solusi |
|---------|--------|
| Loading lama | Periksa koneksi internet |
| Gambar tidak muncul | Refresh halaman |
| Error 500 | Hubungi Admin, cek status server |

### 6.5 Kontak Bantuan

Jika mengalami kendala teknis, hubungi:
- **Admin SDN Gudang Kopi 1**
- Email: `admin@sdgudangkopi1.my.id`

---

## Ringkasan Cepat

### Guru — Checklist Harian:
- [ ] Buka aplikasi `/absen`
- [ ] Pastikan GPS aktif
- [ ] Clock In dengan selfie
- [ ] Clock Out dengan selfie (saat pulang)
- [ ] Jika sakit/izin: self-report dengan bukti

### Admin — Checklist Berkala:
- [ ] Update berita secara berkala
- [ ] Cek dan update konfigurasi sekolah
- [ ] Input absensi kepsek
- [ ] Export rekap bulanan
- [ ] Tambah/hapus guru sesuai kebutuhan

### Kepsek — Checklist Monitoring:
- [ ] Cek dashboard setiap pagi
- [ ] Pantau guru yang belum absen
- [ ] Review rekap mingguan/bulanan
- [ ] Export laporan untuk arsip

---

*Dokumen ini dibuat untuk SDN Gudang Kopi 1 — Versi 1.0*