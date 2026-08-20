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
  Upload,
  Download,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";

interface Student {
  id: string;
  full_name: string;
  nis: string | null;
  nisn: string | null;
  class_id: string;
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  is_active: boolean;
  classes: {
    name: string;
    grades: {
      level: number;
      name: string;
    };
  };
}

interface ClassOption {
  id: string;
  name: string;
  grades: {
    level: number;
    name: string;
  };
}

export default function AdminStudents() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);

  // Import CSV
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    nis: "",
    nisn: "",
    class_id: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [studentsRes, classesRes] = await Promise.all([
      supabase
        .from("students")
        .select("*, classes(name, grades(level, name))")
        .order("full_name"),
      supabase
        .from("classes")
        .select("*, grades(level, name)")
        .order("name"),
    ]);

    setStudents((studentsRes.data || []) as unknown as Student[]);
    setClasses((classesRes.data || []) as unknown as ClassOption[]);
    setLoading(false);
  }

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.nis || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.nisn || "").toLowerCase().includes(search.toLowerCase());
    const matchClass = !selectedClass || s.class_id === selectedClass;
    return matchSearch && matchClass;
  });

  const groupedStudents = classes
    .filter((c) => !selectedClass || c.id === selectedClass)
    .map((cls) => ({
      class: cls,
      students: filteredStudents.filter((s) => s.class_id === cls.id),
    }))
    .filter((g) => g.students.length > 0 || !selectedClass);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      full_name: "",
      nis: "",
      nisn: "",
      class_id: selectedClass || classes[0]?.id || "",
      parent_name: "",
      parent_phone: "",
      parent_email: "",
    });
    setShowModal(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name,
      nis: student.nis || "",
      nisn: student.nisn || "",
      class_id: student.class_id,
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || "",
      parent_email: student.parent_email || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.class_id) return;
    setSaving(true);

    const data = {
      full_name: formData.full_name,
      nis: formData.nis || null,
      nisn: formData.nisn || null,
      class_id: formData.class_id,
      parent_name: formData.parent_name || null,
      parent_phone: formData.parent_phone || null,
      parent_email: formData.parent_email || null,
    };

    if (editingStudent) {
      await supabase.from("students").update(data).eq("id", editingStudent.id);
    } else {
      await supabase.from("students").insert(data);
    }

    setSaving(false);
    setShowModal(false);
    loadData();
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`Hapus siswa "${student.full_name}"?`)) return;
    await supabase.from("students").delete().eq("id", student.id);
    loadData();
  };

  const handleToggleActive = async (student: Student) => {
    await supabase
      .from("students")
      .update({ is_active: !student.is_active })
      .eq("id", student.id);
    loadData();
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    let success = 0;
    let failed = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });

      const fullName = row["nama"] || row["full_name"] || row["name"] || "";
      const nis = row["nis"] || "";
      const nisn = row["nisn"] || "";
      const className = row["kelas"] || row["class"] || row["class_name"] || "";

      if (!fullName) {
        failed++;
        continue;
      }

      // Find class_id by name
      const matchedClass = classes.find(
        (c) => c.name.toLowerCase() === className.toLowerCase()
      );

      const { error } = await supabase.from("students").insert({
        full_name: fullName,
        nis: nis || null,
        nisn: nisn || null,
        class_id: matchedClass?.id || classes[0]?.id,
        parent_name: row["orang_tua"] || row["parent_name"] || null,
        parent_phone: row["telepon_orang_tua"] || row["parent_phone"] || null,
        parent_email: row["email_orang_tua"] || row["parent_email"] || null,
      });

      if (error) {
        failed++;
      } else {
        success++;
      }
    }

    setImportResult({ success, failed });
    setImporting(false);
    loadData();

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const exportCSV = () => {
    const rows = filteredStudents.map((s) => ({
      Nama: s.full_name,
      NIS: s.nis || "",
      NISN: s.nisn || "",
      Kelas: s.classes?.name || "",
      "Orang Tua": s.parent_name || "",
      "Telepon Orang Tua": s.parent_phone || "",
      "Email Orang Tua": s.parent_email || "",
      Status: s.is_active ? "Aktif" : "Nonaktif",
    }));

    const csv = [
      Object.keys(rows[0] || {}).join(","),
      ...rows.map((r) => Object.values(r).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `siswa_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Users className="w-6 h-6 text-primary-500" />
            <h1 className="font-poppins font-bold text-primary-600 text-lg">Kelola Siswa</h1>
          </div>
          <p className="text-sm text-gray-500 mb-4">{students.length} siswa terdaftar</p>
          <div className="flex items-center justify-center space-x-3">
            <a href="/admin/dashboard" className="text-sm text-primary-500 hover:text-primary-600">← Dashboard</a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, NIS, atau NISN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          >
            <option value="">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.grades?.name} - {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah Siswa
          </button>

          <button
            onClick={() => setShowImport(!showImport)}
            className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import CSV
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>

        {/* Import CSV Panel */}
        {showImport && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Import CSV</h3>
              <button onClick={() => { setShowImport(false); setImportResult(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Format CSV: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">Nama,NIS,NISN,Kelas,Orang_Tua,Telepon_Orang_Tua,Email_Orang_Tua</code>
            </p>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="flex-1 text-sm"
              />
              {importing && <Loader2 className="w-5 h-5 animate-spin text-primary-500" />}
            </div>
            {importResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${importResult.failed === 0 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                ✅ {importResult.success} siswa berhasil diimport
                {importResult.failed > 0 && `, ⚠️ ${importResult.failed} gagal`}
              </div>
            )}
          </div>
        )}

        {/* Student List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada data siswa</p>
            <button onClick={openAddModal} className="mt-4 text-primary-500 hover:text-primary-600 font-medium">
              + Tambah Siswa
            </button>
          </div>
        ) : selectedClass ? (
          /* Flat list when filtered by class */
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">NIS</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">NISN</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Orang Tua</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Telepon</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-center font-medium text-gray-900 text-sm">{student.full_name}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{student.nis || "-"}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{student.nisn || "-"}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{student.parent_name || "-"}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{student.parent_phone || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(student)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {student.is_active ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button onClick={() => openEditModal(student)} className="p-1.5 text-gray-400 hover:text-primary-500">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(student)} className="p-1.5 text-gray-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grouped by class */
          <div className="space-y-8">
            {groupedStudents.map(({ class: cls, students: classStudents }) => (
              <div key={cls.id}>
                <h2 className="font-poppins font-semibold text-lg text-gray-900 mb-3 text-center flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-primary-500" />
                  {cls.grades?.name} - Kelas {cls.name}
                  <span className="ml-2 text-sm font-normal text-gray-500">({classStudents.length} siswa)</span>
                </h2>

                {classStudents.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Belum ada siswa</p>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">No</th>
                            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">NIS</th>
                            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">NISN</th>
                            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Orang Tua</th>
                            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Telepon</th>
                            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {classStudents.map((student, idx) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-center text-sm text-gray-500">{idx + 1}</td>
                              <td className="px-4 py-3 text-center font-medium text-gray-900 text-sm">{student.full_name}</td>
                              <td className="px-4 py-3 text-center text-sm text-gray-600">{student.nis || "-"}</td>
                              <td className="px-4 py-3 text-center text-sm text-gray-600">{student.nisn || "-"}</td>
                              <td className="px-4 py-3 text-center text-sm text-gray-600">{student.parent_name || "-"}</td>
                              <td className="px-4 py-3 text-center text-sm text-gray-600">{student.parent_phone || "-"}</td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => handleToggleActive(student)}
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    student.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {student.is_active ? "Aktif" : "Nonaktif"}
                                </button>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center space-x-1">
                                  <button onClick={() => openEditModal(student)} className="p-1.5 text-gray-400 hover:text-primary-500">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(student)} className="p-1.5 text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-poppins font-semibold text-lg">
                  {editingStudent ? "Edit Siswa" : "Tambah Siswa"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Nama lengkap siswa"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                    <input
                      type="text"
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      placeholder="Nomor Induk"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
                    <input
                      type="text"
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      placeholder="NISN"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas *</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.grades?.name} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Data Orang Tua</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Orang Tua</label>
                      <input
                        type="text"
                        value={formData.parent_name}
                        onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                        placeholder="Nama orang tua/wali"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                        <input
                          type="text"
                          value={formData.parent_phone}
                          onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                          placeholder="0812xxxxxxxx"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.parent_email}
                          onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                          placeholder="orangtua@email.com"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.full_name || !formData.class_id || saving}
                  className="flex-1 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center"
                >
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