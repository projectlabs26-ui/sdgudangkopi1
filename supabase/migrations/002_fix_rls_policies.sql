-- ============================================
-- 🔧 Fix: Tambah RLS Policies untuk CRUD Admin
-- ============================================
-- Jalankan di Supabase SQL Editor

-- TEACHERS: Admin bisa CRUD
DROP POLICY IF EXISTS "Admin can manage teachers" ON teachers;
CREATE POLICY "Admin can manage teachers" ON teachers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- USERS: Admin bisa update & delete
DROP POLICY IF EXISTS "Admin can update users" ON users;
CREATE POLICY "Admin can update users" ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

DROP POLICY IF EXISTS "Admin can delete users" ON users;
CREATE POLICY "Admin can delete users" ON users
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- CLASSES: Admin bisa CRUD
DROP POLICY IF EXISTS "Admin can manage classes" ON classes;
CREATE POLICY "Admin can manage classes" ON classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- STUDENTS: Admin bisa CRUD (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admin can manage students" ON students;
CREATE POLICY "Admin can manage students" ON students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- TEACHER_CLASSES: Admin bisa CRUD
DROP POLICY IF EXISTS "Admin can manage teacher_classes" ON teacher_classes;
CREATE POLICY "Admin can manage teacher_classes" ON teacher_classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );

-- ATTENDANCES: Admin bisa DELETE
DROP POLICY IF EXISTS "Admin can delete attendance" ON attendances;
CREATE POLICY "Admin can delete attendance" ON attendances
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah'))
  );