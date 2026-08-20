"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Users,
  GraduationCap,
} from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";

interface Grade {
  id: string;
  level: number;
  name: string;
}

interface Class {
  id: string;
  name: string;
  grade_id: string;
  teacher_id: string | null;
  academic_year: string;
  grades: Grade;
  users: { full_name: string } | null;
  student_count?: number;
}

interface TeacherOption {
  id: string;
  user_id: string;
  users: { full_name: string };
}

export default function AdminClasses() {
  const supabase = createClient();
  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({ name: "", grade_id: "", teacher_id: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [classesRes, gradesRes, teachersRes] = await Promise.all([
      supabase.from("classes").select("*, grades(*), users(full_name)").order("name"),
      supabase.from("grades").select("*").order("level"),
      supabase.from("teachers").select("id, user_id, users(full_name)"),
    ]);
    const classList = (classesRes.data || []) as unknown as Class[];
    for (const cls of classList) {
      const { count } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("class_id", cls.id);
      cls.student_count = count || 0;
    }
    setClasses(classList);
    setGrades(gradesRes.data || []);
    setTeachers((teachersRes.data || []) as unknown as TeacherOption[]);
    setLoading(false);
  }

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({ name: "", grade_id: grades[0]?.id || "", teacher_id: "" });
    setShowModal(true);
  };

  const openEditModal = (cls: Class) => {
    setEditingClass(cls);
    setFormData({ name: cls.name, grade_id: cls.grade_id, teacher_id: cls.teacher_id || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { name: formData.name, grade_id: formData.grade_id, teacher_id: formData.teacher_id || null };
    if (editingClass) {
      await supabase.from("classes").update(data).eq("id", editingClass.id);
    } else {
      await supabase.from("classes").insert(data);
    }
    setSaving(false);
    setShowModal(false);
    loadData();
  };

  const handleDelete = async (cls: Class) => {
    if (!confirm(`Hapus kelas ${cls.name}?`)) return;
    await supabase.from("classes").delete().eq("id", cls.id);
    loadData();
  };

  const groupedClasses = grades.map((grade) => ({
    grade,
    classes: classes.filter((c) => c.grade_id === grade.id),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <BookOpen className="w-6 h-6 text-primary-500" />
            <h1 className="font-poppins font-bold text-primary-600 text-lg">Kelola Kelas</h1>
          </div>
          <p className="text-sm text-gray-500 mb-4">{classes.length} kelas terdaftar</p>
          <div className="flex items-center justify-center space-x-3">
            <a href="/admin/dashboard" className="text-sm text-primary-500 hover:text-primary-600">← Dashboard</a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-center mb-6">
          <button onClick={openAddModal} className="flex items-center px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
            <Plus className="w-5 h-5 mr-2" />
            Tambah Kelas
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
          </div>
        ) : (
          <div className="space-y-8">
            {groupedClasses.map(({ grade, classes: gradeClasses }) => (
              <div key={grade.id}>
                <h2 className="font-poppins font-semibold text-lg text-gray-900 mb-3 text-center flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-primary-500" />
                  {grade.name}
                </h2>
                {gradeClasses.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center">Belum ada kelas</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gradeClasses.map((cls) => (
                      <div key={cls.id} className="bg-white rounded-xl shadow-sm p-5 text-center">
                        <div className="flex justify-end mb-2 space-x-1">
                          <button onClick={() => openEditModal(cls)} className="p-1.5 text-gray-400 hover:text-primary-500">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(cls)} className="p-1.5 text-gray-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900">Kelas {cls.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{cls.academic_year}</p>
                        <div className="flex items-center justify-center text-sm text-gray-500 mb-1">
                          <Users className="w-4 h-4 mr-1" />
                          {cls.student_count || 0} siswa
                        </div>
                        {cls.users && (
                          <div className="flex items-center justify-center text-sm text-gray-500">
                            <BookOpen className="w-4 h-4 mr-1" />
                            Wali: {cls.users.full_name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-poppins font-semibold text-lg">
                  {editingClass ? "Edit Kelas" : "Tambah Kelas"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat *</label>
                  <select value={formData.grade_id} onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                    {grades.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: 1A, 2B, 3A"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wali Kelas</label>
                  <select value={formData.teacher_id} onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">-- Pilih Wali Kelas --</option>
                    {teachers.map((t) => (<option key={t.id} value={t.user_id}>{t.users.full_name}</option>))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button onClick={handleSave} disabled={!formData.name || !formData.grade_id || saving}
                  className="flex-1 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
