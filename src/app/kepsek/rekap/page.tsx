"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Download,
  Users,
  FileText,
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
  users: {
    full_name: string;
  };
}

export default function KepsekRekap() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"monthly" | "weekly">("monthly");

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  async function loadData() {
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

    setUser(user);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

    const { data } = await supabase
      .from("attendances")
      .select("*, users(full_name)")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    setRecords((data || []) as unknown as AttendanceRecord[]);
    setLoading(false);
  }

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const monthName = currentMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  // ===== STATS =====
  const stats = {
    hadir: records.filter((r) => r.status === "hadir").length,
    terlambat: records.filter((r) => r.status === "terlambat").length,
    sakit: records.filter((r) => r.status === "sakit").length,
    izin: records.filter((r) => r.status === "izin").length,
    alpa: records.filter((r) => r.status === "alpa").length,
  };

  const totalRecords = stats.hadir + stats.terlambat + stats.sakit + stats.izin + stats.alpa;
  const percentage = totalRecords > 0 ? Math.round(((stats.hadir + stats.terlambat) / totalRecords) * 100) : 0;

  // ===== TEACHER SUMMARY =====
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

  // ===== DAILY TREND =====
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const dailyTrend = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayRecords = records.filter((r) => r.date === dateStr);
    return {
      day,
      total: dayRecords.length,
      hadir: dayRecords.filter((r) => r.status === "hadir" || r.status === "terlambat").length,
      alpa: dayRecords.filter((r) => r.status === "alpa").length,
    };
  });

  const maxDaily = Math.max(...dailyTrend.map((d) => d.total), 1);

  // ===== WEEKLY =====
  const weeklyData = [];
  for (let week = 0; week < 5; week++) {
    const start = week * 7 + 1;
    const end = Math.min(start + 6, daysInMonth);
    const weekRecords = records.filter((r) => {
      const day = parseInt(r.date.split("-")[2]);
      return day >= start && day <= end;
    });
    weeklyData.push({
      week: week + 1,
      range: `${start}-${end}`,
      total: weekRecords.length,
      hadir: weekRecords.filter((r) => r.status === "hadir" || r.status === "terlambat").length,
      alpa: weekRecords.filter((r) => r.status === "alpa").length,
    });
  }

  // ===== COMPARISON =====
  const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
  const [prevMonthRecords, setPrevMonthRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    async function loadPrevMonth() {
      const year = prevMonthDate.getFullYear();
      const month = prevMonthDate.getMonth() + 1;
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

      const { data } = await supabase
        .from("attendances")
        .select("*, users(full_name)")
        .gte("date", startDate)
        .lte("date", endDate);

      setPrevMonthRecords((data || []) as unknown as AttendanceRecord[]);
    }
    loadPrevMonth();
  }, [currentMonth]);

  const prevTotal = prevMonthRecords.length;
  const prevHadir = prevMonthRecords.filter((r) => r.status === "hadir" || r.status === "terlambat").length;
  const prevPercentage = prevTotal > 0 ? Math.round((prevHadir / prevTotal) * 100) : 0;
  const trend = percentage - prevPercentage;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
            <h1 className="font-poppins font-bold text-primary-600 text-lg">Rekap Kehadiran</h1>
          </div>
          <p className="text-sm text-gray-500 mb-4">{monthName}</p>
          <div className="flex items-center justify-center space-x-3">
            <a href="/kepsek/dashboard" className="text-sm text-primary-500 hover:text-primary-600">← Dashboard</a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Month Navigator */}
        <div className="flex items-center justify-center space-x-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg bg-white shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-poppins font-semibold text-lg">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg bg-white shadow-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-sm p-1 inline-flex">
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "monthly" ? "bg-primary-500 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "weekly" ? "bg-primary-500 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Mingguan
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                <BarChart3 className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-600">{percentage}%</p>
                <p className="text-xs text-gray-500">Kehadiran</p>
                {prevTotal > 0 && (
                  <p className={`text-xs mt-1 flex items-center justify-center ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {trend >= 0 ? "+" : ""}{trend}% dari bulan lalu
                  </p>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{stats.hadir}</p>
                <p className="text-xs text-gray-500">Hadir</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{stats.terlambat}</p>
                <p className="text-xs text-gray-500">Terlambat</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{stats.sakit + stats.izin}</p>
                <p className="text-xs text-gray-500">Sakit/Izin</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{stats.alpa}</p>
                <p className="text-xs text-gray-500">Alpa</p>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-poppins font-semibold text-gray-900 mb-4 text-center">
                {viewMode === "monthly" ? "Tren Kehadiran Harian" : "Tren Kehadiran Mingguan"}
              </h3>
              {viewMode === "monthly" ? (
                <div className="flex items-end gap-1 h-40 overflow-x-auto">
                  {dailyTrend.map((d) => (
                    <div key={d.day} className="flex-1 min-w-[20px] flex flex-col items-center">
                      <div className="w-full flex flex-col items-center" style={{ height: "140px" }}>
                        <div className="mt-auto w-full flex flex-col items-center">
                          <div
                            className="w-full bg-green-400 rounded-t"
                            style={{ height: `${(d.hadir / maxDaily) * 100}px`, minHeight: d.hadir > 0 ? "4px" : "0" }}
                          />
                          {d.alpa > 0 && (
                            <div
                              className="w-full bg-red-400 rounded-t"
                              style={{ height: `${(d.alpa / maxDaily) * 100}px`, minHeight: "4px" }}
                            />
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{d.day}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {weeklyData.filter((w) => w.total > 0).map((w) => (
                    <div key={w.week} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 w-20">Minggu {w.week}</span>
                      <span className="text-xs text-gray-400 w-16">{w.range}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${w.total > 0 ? (w.hadir / w.total) * 100 : 0}%` }}
                        >
                          {w.total > 0 ? Math.round((w.hadir / w.total) * 100) + "%" : ""}
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{w.hadir}/{w.total} hadir</span>
                    </div>
                  ))}
                  {weeklyData.filter((w) => w.total > 0).length === 0 && (
                    <p className="text-center text-gray-400 py-8">Belum ada data</p>
                  )}
                </div>
              )}
            </div>

            {/* Teacher Comparison */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b text-center">
                <h3 className="font-poppins font-semibold text-gray-900 flex items-center justify-center">
                  <Users className="w-5 h-5 mr-2 text-primary-500" />
                  Perbandingan Antar Guru
                </h3>
              </div>
              {sortedTeachers.length === 0 ? (
                <div className="p-12 text-center text-gray-400">Belum ada data</div>
              ) : (
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
                        <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Bar</th>
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
                            <td className="px-4 py-3">
                              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden mx-auto">
                                <div
                                  className={`h-full rounded-full ${pct >= 90 ? "bg-green-500" : pct >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Export Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`/api/export?type=attendance&month=${currentMonth.toISOString().slice(0, 7)}`}
                className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-medium"
              >
                <Download className="w-5 h-5 mr-2" />
                Export Excel - Bulan Ini
              </a>
              <a
                href="/kepsek/laporan"
                className="flex items-center justify-center px-4 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-medium"
              >
                <FileText className="w-5 h-5 mr-2" />
                Laporan Lengkap
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}