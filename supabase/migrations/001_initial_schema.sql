-- ============================================
-- 🗄️ SD Gudang Kopi 1 - Database Schema
-- ============================================
-- Jalankan file ini di Supabase SQL Editor
-- https://supabase.com/dashboard → SQL Editor

-- ============================================
-- 1. USERS (Auth + Profile)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guru',
  -- Role: 'kepala_sekolah' | 'admin' | 'guru' | 'siswa'
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger untuk auto-create user profile saat signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'guru')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger saat user baru signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. GRADES (Tingkat 1-6)
-- ============================================
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level INT NOT NULL UNIQUE,  -- 1, 2, 3, 4, 5, 6
  name TEXT NOT NULL           -- "Kelas 1", "Kelas 2", dst
);

-- Insert data grades
INSERT INTO grades (level, name) VALUES
  (1, 'Kelas 1'),
  (2, 'Kelas 2'),
  (3, 'Kelas 3'),
  (4, 'Kelas 4'),
  (5, 'Kelas 5'),
  (6, 'Kelas 6');

-- ============================================
-- 3. CLASSES (Rombongan: 1A, 1B, 2A...)
-- ============================================
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grade_id UUID REFERENCES grades(id),
  name TEXT NOT NULL,          -- "1A", "1B", "2A"
  teacher_id UUID REFERENCES users(id),  -- wali kelas
  academic_year TEXT DEFAULT '2025/2026',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. TEACHERS (Detail guru)
-- ============================================
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE,
  subject TEXT,                -- "Matematika", "PJOK", dst
  photo_url TEXT,
  bio TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- ============================================
-- 5. TEACHER_CLASSES (Relasi guru ↔ kelas)
-- ============================================
CREATE TABLE teacher_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id),
  class_id UUID REFERENCES classes(id),
  subject TEXT,
  UNIQUE(teacher_id, class_id, subject)
);

-- ============================================
-- 6. STUDENTS (Phase 2)
-- ============================================
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

-- ============================================
-- 7. ATTENDANCES (Absensi guru)
-- ============================================
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

-- ============================================
-- 8. SCHOOL_PROFILE
-- ============================================
CREATE TABLE school_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Info Profil
  school_name TEXT NOT NULL DEFAULT 'SD Gudang Kopi 1',
  slogan TEXT DEFAULT 'Mencerdaskan Generasi Bangsa',
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
  latitude DECIMAL(10, 8) DEFAULT -6.2088,
  longitude DECIMAL(11, 8) DEFAULT 106.8456,
  radius_meters INT DEFAULT 100,

  -- Jam Kerja
  clock_in_start TIME DEFAULT '07:00',
  clock_in_end TIME DEFAULT '08:30',
  clock_out_start TIME DEFAULT '14:00',
  clock_out_end TIME DEFAULT '16:00',
  late_tolerance_minutes INT DEFAULT 15,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default school profile
INSERT INTO school_profile (school_name, slogan)
VALUES ('SD Gudang Kopi 1', 'Mencerdaskan Generasi Bangsa');

-- ============================================
-- 9. NEWS (Berita & Pengumuman)
-- ============================================
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

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS untuk semua tabel
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- USERS: Public bisa lihat profile guru
CREATE POLICY "Public can view teacher profiles" ON users
  FOR SELECT USING (role = 'guru' AND is_active = true);

-- USERS: User bisa lihat data sendiri
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- USERS: Admin bisa lihat semua
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- GRADES: Public bisa lihat
CREATE POLICY "Public can view grades" ON grades
  FOR SELECT USING (true);

-- CLASSES: Public bisa lihat
CREATE POLICY "Public can view classes" ON classes
  FOR SELECT USING (true);

-- TEACHERS: Public bisa lihat
CREATE POLICY "Public can view teachers" ON teachers
  FOR SELECT USING (is_active = true);

-- TEACHERS: Admin bisa CRUD
CREATE POLICY "Admin can manage teachers" ON teachers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- TEACHER_CLASSES: Public bisa lihat
CREATE POLICY "Public can view teacher classes" ON teacher_classes
  FOR SELECT USING (true);

-- TEACHER_CLASSES: Admin bisa CRUD
CREATE POLICY "Admin can manage teacher_classes" ON teacher_classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- STUDENTS: Admin bisa lihat semua
CREATE POLICY "Admin can view all students" ON students
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- STUDENTS: Admin bisa CRUD
CREATE POLICY "Admin can manage students" ON students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- ATTENDANCES: User bisa lihat data sendiri
CREATE POLICY "Users can view own attendance" ON attendances
  FOR SELECT USING (auth.uid() = user_id);

-- ATTENDANCES: User bisa insert data sendiri
CREATE POLICY "Users can insert own attendance" ON attendances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ATTENDANCES: User bisa update data sendiri
CREATE POLICY "Users can update own attendance" ON attendances
  FOR UPDATE USING (auth.uid() = user_id);

-- ATTENDANCES: Admin bisa lihat semua
CREATE POLICY "Admin can view all attendance" ON attendances
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- ATTENDANCES: Admin bisa insert manual
CREATE POLICY "Admin can insert attendance" ON attendances
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- ATTENDANCES: Admin bisa update
CREATE POLICY "Admin can update attendance" ON attendances
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- ATTENDANCES: Admin bisa delete
CREATE POLICY "Admin can delete attendance" ON attendances
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- USERS: Admin bisa update
CREATE POLICY "Admin can update users" ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- USERS: Admin bisa delete
CREATE POLICY "Admin can delete users" ON users
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- CLASSES: Admin bisa CRUD
CREATE POLICY "Admin can manage classes" ON classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- SCHOOL_PROFILE: Public bisa lihat
CREATE POLICY "Public can view school profile" ON school_profile
  FOR SELECT USING (true);

-- SCHOOL_PROFILE: Admin bisa update
CREATE POLICY "Admin can update school profile" ON school_profile
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- NEWS: Public bisa lihat yang published
CREATE POLICY "Public can view published news" ON news
  FOR SELECT USING (is_published = true);

-- NEWS: Admin bisa CRUD
CREATE POLICY "Admin can manage news" ON news
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- ============================================
-- 11. STORAGE BUCKETS
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('selfies', 'selfies', false),
  ('news-images', 'news-images', true),
  ('school-media', 'school-media', true);

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for selfies (private)
CREATE POLICY "Admin can view all selfies" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'selfies'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

CREATE POLICY "Users can upload own selfies" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'selfies'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for news images
CREATE POLICY "Anyone can view news images" ON storage.objects
  FOR SELECT USING (bucket_id = 'news-images');

CREATE POLICY "Admin can manage news images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'news-images'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- Storage policies for school media
CREATE POLICY "Anyone can view school media" ON storage.objects
  FOR SELECT USING (bucket_id = 'school-media');

CREATE POLICY "Admin can manage school media" ON storage.objects
  FOR ALL USING (
    bucket_id = 'school-media'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- ============================================
-- 12. INDEXES (Performance)
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_classes_grade_id ON classes(grade_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_attendances_user_id ON attendances(user_id);
CREATE INDEX idx_attendances_date ON attendances(date);
CREATE INDEX idx_attendances_user_date ON attendances(user_id, date);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_published ON news(is_published, published_at);

-- ============================================
-- ✅ DONE! Database schema berhasil dibuat
-- ============================================
