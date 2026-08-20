-- ============================================
-- 📸 Self-Report: Tambah kolom bukti gambar
-- ============================================
-- Jalankan di Supabase SQL Editor

-- Tambah kolom untuk bukti gambar sakit/izin
ALTER TABLE attendances 
ADD COLUMN IF NOT EXISTS proof_image_url TEXT;

-- Storage policy untuk proof images (pakai bucket selfies)
CREATE POLICY "Users can upload own proof images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'selfies'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );