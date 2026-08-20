"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: string;
  clock_in: string | null;
  clock_out: string | null;
  clock_in_status: string | null;
  users: {
    full_name: string;
    email: string;
  };
}

interface UserOption {
  id: string;
  full_name: string;
  role: string;
}

export default function AdminAttendance() {
  const router = useRouter();
  const supabase = createClient();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [addForm, setAddForm] = useState({
    user_id: "",
    date: new Date().toISOString().split("T")[0],
    status: "hadir",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAttendance();
    loadUsers();
  }, [currentMonth]);

  async function loadAttendance() {
    setLoading(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

    const { data } = await supabase
      .from("attendances")
      .select("*, users(full_name, email)")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    setRecords((data || []) as unknown as AttendanceRecord[]);
    setLoading(false);
  }

  async function loadUsers() {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, role")
      .in("role", ["guru", "kepala_sekolah"])
      .eq("is_active", true);
    setUsers((data || []) as UserOption[]);
  }

  const handleAddAttendance = async () => {
    if (!addForm.user_id || !addForm.date) return;
    setSaving(true);
    const { error } = await supabase.from("attendances").upsert(
      { user_id: addForm.user_id, date: addForm.date, status: addForm.status, note: addForm.note || null },
      { onConflict: "user_id,date" }
    );
    if (error) {
      alert("Error: " + error.message);
    } else {
      setShowAddModal(false);
      setAddForm({ user_id: "", date: new Date().toISOString().split("T")[0], status: "hadir", note: "" });
      loadAttendance();
    }
    setSaving(false);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const stats = {
    hadir: records.filter((r) => r.status === "hadir").length,
    terlambat: records.filter((r) => r.status === "terlambat").length,
    sakit: records.filter((r) => r.status === "sakit").length,
    izin: records.filter((r) => r.status === "izin").length,
    alpa: records.filter((r) => r.status === "alpa").length,
  };

  const totalRecords = stats.hadir + stats.terlambat + stats.sakit + stats.izin + stats.alpa;
  const percentage = totalRecords > 0 ? Math.round(((stats.hadir + stats.terlambat) / totalRecords) * 100) : 0;

  const teacherSummary = records.reduce((acc, record) => {
    const name = record.users?.full_name || "Unknown";
    if (!acc[name]) {
      acc[name] = { hadir: 0, terlambat: 0, sakit: 0, izin: 0, alpa: 0, total: 0 };
    }
    acc[name][record.status as keyof typeof acc["name"]] = (acc[name][record.status as keyof typeof acc["name"]] || 0) + 1;
    acc[name].total++;
    return acc;
  }, {} as Record<string, { hadir: number; terlambat: number; sakit: number; izin: number; alpa: number; total: number }>);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <BarChart3 className="w-6 h-6 text-primary-500" />
            <h1 className="font-poppins font-bold text-primary-600 text-lg">Rekap Absensi</h1>
          </div>
          <p className="text-sm text-gray-500 mb-4">{monthName}</p>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Input Manual
            </button>
            <a href="/admin/dashboard" className="text-sm text-primary-500 hover:text-primary-600">← Dashboard</a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Month Navigator */}
        <div className="flex items-center justify-center mb-6 space-x-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-poppins font-semibold text-lg">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <BarChart3 className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary-600">{percentage}%</p>
            <p className="text-sm text-gray-500">Kehadiran</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{stats.hadir}</p>
            <p className="text-sm text-gray-500">Hadir</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{stats.terlambat}</p>
            <p className="text-sm text-gray-500">Terlambat</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{stats.sakit + stats.izin}</p>
            <p className="text-sm text-gray-500">Sakit/Izin</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{stats.alpa}</p>
            <p className="text-sm text-gray-500">Alpa</p>
          </div>
        </div>

        {/* Teacher Summary */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b text-center">
            <h3 className="font-poppins font-semibold text-gray-900">Ringkasan per Guru</h3>
          </div>
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
          ) : Object.keys(teacherSummary).length === 0 ? (
            <div className="p-12 text-center text-gray-400">Belum ada data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Hadir</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Terlambat</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sakit</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Izin</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Alpa</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(teacherSummary).map(([name, data]) => {
                    const pct = data.total > 0 ? Math.round(((data.hadir + data.terlambat) / data.total) * 100) : 0;
                    return (
                      <tr key={name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-center font-medium text-gray-900">{name}</td>
                        <td className="px-4 py-4 text-center text-green-600 font-medium">{data.hadir}</td>
                        <td className="px-4 py-4 text-center text-yellow-600 font-medium">{data.terlambat}</td>
                        <td className="px-4 py-4 text-center text-red-600 font-medium">{data.sakit}</td>
                        <td className="px-4 py-4 text-center text-orange-600 font-medium">{data.izin}</td>
                        <td className="px-4 py-4 text-center text-red-600 font-medium">{data.alpa}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            pct >= 90 ? "bg-green-100 text-green-700" :
                            pct >= 70 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>{pct}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Records */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b text-center">
            <h3 className="font-poppins font-semibold text-gray-900">Detail Absensi</h3>
          </div>
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Belum ada data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Masuk</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Keluar</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {new Date(record.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-900">{record.users?.full_name}</td>
                      <td className="px-4 py-4 text-center text-sm text-gray-600">
                        {record.clock_in ? new Date(record.clock_in).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-600">
                        {record.clock_out ? new Date(record.clock_out).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === "hadir" ? "bg-green-100 text-green-700" :
                          record.status === "terlambat" ? "bg-yellow-100 text-yellow-700" :
                          record.status === "sakit" ? "bg-red-100 text-red-700" :
                          record.status === "izin" ? "bg-orange-100 text-orange-700" :
                          "bg-red-100 text-red-700"
                        }`}>{record.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Manual Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-poppins font-semibold text-lg">Input Absensi Manual</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guru / Kepsek *</label>
                  <select value={addForm.user_id} onChange={(e) => setAddForm({ ...addForm, user_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">-- Pilih --</option>
                    {users.map((u) => (<option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
                  <input type="date" value={addForm.date} onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="hadir">Hadir</option>
                    <option value="sakit">Sakit</option>
                    <option value="izin">Izin</option>
                    <option value="alpa">Alpa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                  <textarea value={addForm.note} onChange={(e) => setAddForm({ ...addForm, note: e.target.value })} rows={2}
                    placeholder="Catatan opsional..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button onClick={handleAddAttendance} disabled={!addForm.user_id || !addForm.date || saving}
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
