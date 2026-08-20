"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  Calendar,
  Loader2,
  Printer,
  FileSpreadsheet,
  ChevronLeft,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";
import Image from "next/image";

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: string;
  clock_in: string | null;
  clock_out: string | null;
  clock_in_status: string | null;
  note: string | null;
  users: {
    full_name: string;
  };
}

export default function KepsekLaporan() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [reportGenerated, setReportGenerated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "kepala_sekolah") {
      router.push("/absen");
      return;
    }
    setLoading(false);
  }

  async function generateReport() {
    setGenerating(true);
    setReportGenerated(false);

    const { data } = await supabase
      .from("attendances")
      .select("*, users(full_name)")
      .gte("date", dateRange.start)
      .lte("date", dateRange.end)
      .order("date", { ascending: false });

    setRecords((data || []) as unknown as AttendanceRecord[]);
    setReportGenerated(true);
    setGenerating(false);
  }

  const stats = {
    hadir: records.filter((r) => r.status === "hadir").length,
    terlambat: records.filter((r) => r.status === "terlambat").length,
    sakit: records.filter((r) => r.status === "sakit").length,
    izin: records.filter((r) => r.status === "izin").length,
    alpa: records.filter((r) => r.status === "alpa").length,
  };

  const total = stats.hadir + stats.terlambat + stats.sakit + stats.izin + stats.alpa;
  const percentage = total > 0 ? Math.round(((stats.hadir + stats.terlambat) / total) * 100) : 0;

  // Teacher summary
  const teacherSummary = records.reduce((acc, record) => {
    const name = record.users?.full_name || "Unknown";
    if (!acc[name]) {
      acc[name] = { hadir: 0, terlambat: 0, sakit: 0, izin: 0, alpa: 0, total: 0 };
    }
    acc[name][record.status as keyof typeof acc["name"]] = (acc[name][record.status as keyof typeof acc["name"]] || 0) + 1;
    acc[name].total++;
    return acc;
  }, {} as Record<string, { hadir: number; terlambat: number; sakit: number; izin: number; alpa: number; total: number }>);

  const sortedTeachers = Object.entries(teacherSummary).sort(([, a], [, b]) => b.total - a.total);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const rows = records.map((r) => ({
      Tanggal: r.date,
      Nama: r.users?.full_name || "",
      "Jam Masuk": r.clock_in ? new Date(r.clock_in).toLocaleTimeString("id-ID") : "",
      "Jam Keluar": r.clock_out ? new Date(r.clock_out).toLocaleTimeString("id-ID") : "",
      "Status Masuk": r.clock_in_status === "tepat_waktu" ? "Tepat Waktu" : r.clock_in_status === "terlambat" ? "Terlambat" : "",
      Status: r.status,
      Keterangan: r.note || "",
    }));

    const csv = [
      Object.keys(rows[0] || {}).join(","),
      ...rows.map((r) => Object.values(r).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan_${dateRange.start}_${dateRange.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const dateRangeLabel = `${new Date(dateRange.start).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} - ${new Date(dateRange.end).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
            <h1 className="font-poppins font-bold text-primary-600 text-lg">Laporan Kehadiran</h1>
          </div>
          <p className="text-sm text-gray-500 mb-4">Generate laporan untuk periode tertentu</p>
          <div className="flex items-center justify-center space-x-3">
            <a href="/kepsek/dashboard" className="text-sm text-primary-500 hover:text-primary-600">← Dashboard</a>
            <a href="/kepsek/rekap" className="text-sm text-primary-500 hover:text-primary-600">← Rekap</a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Date Range Picker */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-poppins font-semibold text-gray-900 mb-4 text-center flex items-center justify-center">
            <Calendar className="w-5 h-5 mr-2 text-primary-500" />
            Pilih Periode Laporan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Quick Select */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {[
              { label: "Bulan Ini", start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: new Date() },
              { label: "Bulan Lalu", start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), end: new Date(new Date().getFullYear(), new Date().getMonth(), 0) },
              { label: "7 Hari", start: new Date(Date.now() - 7 * 86400000), end: new Date() },
              { label: "30 Hari", start: new Date(Date.now() - 30 * 86400000), end: new Date() },
              { label: "Tahun Ini", start: new Date(new Date().getFullYear(), 0, 1), end: new Date() },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setDateRange({
                  start: opt.start.toISOString().split("T")[0],
                  end: opt.end.toISOString().split("T")[0],
                })}
                className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={generateReport}
            disabled={generating}
            className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center"
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menghasilkan...</>
            ) : (
              <><BarChart3 className="w-5 h-5 mr-2" /> Generate Laporan</>
            )}
          </button>
        </div>

        {/* Report Result */}
        {reportGenerated && (
          <>
            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-poppins font-semibold text-gray-900">
                  📊 Ringkasan Laporan
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Cetak
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    Export Excel
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4 text-center">
                Periode: {dateRangeLabel} • Total: {total} record • {Object.keys(teacherSummary).length} guru
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary-600">{percentage}%</p>
                  <p className="text-xs text-gray-500">Kehadiran</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-600">{stats.hadir}</p>
                  <p className="text-xs text-gray-500">Hadir</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Clock className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-yellow-600">{stats.terlambat}</p>
                  <p className="text-xs text-gray-500">Terlambat</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-red-600">{stats.sakit + stats.izin}</p>
                  <p className="text-xs text-gray-500">Sakit/Izin</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-red-600">{stats.alpa}</p>
                  <p className="text-xs text-gray-500">Alpa</p>
                </div>
              </div>
            </div>

            {/* Teacher Summary */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b text-center">
                <h3 className="font-poppins font-semibold text-gray-900">Rekap per Guru</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nama</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Hadir</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Terlambat</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sakit</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Izin</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Alpa</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedTeachers.map(([name, data]) => {
                      const pct = data.total > 0 ? Math.round(((data.hadir + data.terlambat) / data.total) * 100) : 0;
                      return (
                        <tr key={name} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-center font-medium text-gray-900 text-sm">{name}</td>
                          <td className="px-4 py-3 text-center text-green-600 font-medium text-sm">{data.hadir}</td>
                          <td className="px-4 py-3 text-center text-yellow-600 font-medium text-sm">{data.terlambat}</td>
                          <td className="px-4 py-3 text-center text-red-600 font-medium text-sm">{data.sakit}</td>
                          <td className="px-4 py-3 text-center text-orange-600 font-medium text-sm">{data.izin}</td>
                          <td className="px-4 py-3 text-center text-red-600 font-medium text-sm">{data.alpa}</td>
                          <td className="px-4 py-3 text-center">
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
            </div>

            {/* Detail Records */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b text-center">
                <h3 className="font-poppins font-semibold text-gray-900">Detail Absensi</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nama</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Masuk</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Keluar</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                          Tidak ada data untuk periode ini
                        </td>
                      </tr>
                    ) : (
                      records.slice(0, 100).map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                          </td>
                          <td className="px-4 py-3 text-center font-medium text-gray-900 text-sm">
                            {record.users?.full_name}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {record.clock_in ? new Date(record.clock_in).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {record.clock_out ? new Date(record.clock_out).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              record.status === "hadir" ? "bg-green-100 text-green-700" :
                              record.status === "terlambat" ? "bg-yellow-100 text-yellow-700" :
                              record.status === "sakit" ? "bg-red-100 text-red-700" :
                              record.status === "izin" ? "bg-orange-100 text-orange-700" :
                              "bg-red-100 text-red-700"
                            }`}>{record.status}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-500">{record.note || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {records.length > 100 && (
                <p className="text-center text-sm text-gray-400 py-4">
                  Menampilkan 100 dari {records.length} record. Export untuk data lengkap.
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}