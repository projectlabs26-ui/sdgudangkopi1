"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Search,
  Camera,
  Power,
  PowerOff,
} from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";
import Image from "next/image";

interface Teacher {
  id: string;
  user_id: string;
  subject: string | null;
  photo_url: string | null;
  bio: string | null;
  display_order: number;
  is_active: boolean;
  users: {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
  };
}

export default function AdminTeachers() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    subject: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    const { data } = await supabase
      .from("teachers")
      .select("*, users(id, email, full_name, phone)")
      .order("display_order");

    if (data) setTeachers(data as unknown as Teacher[]);
    setLoading(false);
  }

  const filteredTeachers = teachers.filter((t) => {
    const matchSearch =
      t.users?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && t.is_active) ||
      (filterStatus === "inactive" && !t.is_active);
    return matchSearch && matchStatus;
  });

  const activeCount = teachers.filter((t) => t.is_active).length;
  const inactiveCount = teachers.filter((t) => !t.is_active).length;

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({ full_name: "", email: "", password: "", phone: "", subject: "", bio: "" });
    setPhotoPreview(null);
    setPhotoFile(null);
    setShowModal(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      full_name: teacher.users?.full_name || "",
      email: teacher.users?.email || "",
      password: "",
      phone: teacher.users?.phone || "",
      subject: teacher.subject || "",
      bio: teacher.bio || "",
    });
    setPhotoPreview(teacher.photo_url || null);
    setPhotoFile(null);
    setShowModal(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran foto maksimal 2MB");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (userId: string): Promise<string | null> => {
    if (!photoFile) return null;
    const fileName = `${userId}/avatar.jpg`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, photoFile, { upsert: true });
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    if (editingTeacher) {
      let photoUrl = editingTeacher.photo_url;
      if (photoFile) {
        photoUrl = await uploadPhoto(editingTeacher.user_id);
      }
      await supabase
        .from("users")
        .update({ full_name: formData.full_name, phone: formData.phone || null })
        .eq("id", editingTeacher.user_id);
      await supabase
        .from("teachers")
        .update({ subject: formData.subject || null, bio: formData.bio || null, photo_url: photoUrl })
        .eq("id", editingTeacher.id);
    } else {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password || "Guru123456!",
        options: { data: { full_name: formData.full_name, role: "guru" } },
      });
      if (authError) {
        alert("Error: " + authError.message);
        setSaving(false);
        return;
      }
      if (authData.user) {
        let photoUrl: string | null = null;
        if (photoFile) {
          photoUrl = await uploadPhoto(authData.user.id);
        }
        await supabase.from("teachers").insert({
          user_id: authData.user.id,
          subject: formData.subject || null,
          bio: formData.bio || null,
          photo_url: photoUrl,
          display_order: teachers.length,
        });
      }
    }
    setSaving(false);
    setShowModal(false);
    loadTeachers();
  };

  const handleToggleActive = async (teacher: Teacher) => {
    await supabase
      .from("teachers")
      .update({ is_active: !teacher.is_active })
      .eq("id", teacher.id);
    loadTeachers();
  };

  const handleDelete = async (teacher: Teacher) => {
    if (!confirm(`Hapus guru ${teacher.users?.full_name}?`)) return;
    await supabase.from("teachers").delete().eq("id", teacher.id);
    loadTeachers();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Users className="w-6 h-6 text-primary-500" />
            <h1 className="font-poppins font-bold text-primary-600 text-lg">Kelola Guru</h1>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {teachers.length} guru terdaftar ({activeCount} aktif, {inactiveCount} nonaktif)
          </p>
          <div className="flex items-center justify-center space-x-3">
            <a href="/admin/dashboard" className="text-sm text-primary-500 hover:text-primary-600">← Dashboard</a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari guru..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "all", label: "Semua" },
              { value: "active", label: "Aktif" },
              { value: "inactive", label: "Nonaktif" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value as typeof filterStatus)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === opt.value
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={openAddModal} className="flex items-center justify-center px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
            <Plus className="w-5 h-5 mr-2" />
            Tambah Guru
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada guru</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className={`bg-white rounded-xl shadow-sm p-5 text-center ${!teacher.is_active ? "opacity-60" : ""}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${teacher.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {teacher.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                  <div className="flex space-x-1">
                    <button onClick={() => openEditModal(teacher)} className="p-1.5 text-gray-400 hover:text-primary-500"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleToggleActive(teacher)} className={`p-1.5 hover:text-yellow-500 ${teacher.is_active ? "text-gray-400" : "text-yellow-500"}`} title={teacher.is_active ? "Nonaktifkan" : "Aktifkan"}>
                      {teacher.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(teacher)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center mx-auto mb-3">
                  {teacher.photo_url ? (
                    <Image src={teacher.photo_url} alt={teacher.users?.full_name || ""} width={64} height={64} className="object-cover" />
                  ) : (
                    <span className="text-3xl">👨‍🏫</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{teacher.users?.full_name}</h3>
                <p className="text-sm text-gray-500 mb-2">{teacher.users?.email}</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>📚 {teacher.subject || "-"}</p>
                  <p>📞 {teacher.users?.phone || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-poppins font-semibold text-lg">{editingTeacher ? "Edit Guru" : "Tambah Guru"}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">👨‍🏫</span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mb-4">Klik ikon kamera untuk upload foto (maks 2MB)</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                  <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                {!editingTeacher && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-gray-400">(default: Guru123456!)</span></label>
                      <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Kosongkan untuk default"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                  <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Contoh: Matematika"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button onClick={handleSave} disabled={!formData.full_name || (!editingTeacher && !formData.email) || saving}
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