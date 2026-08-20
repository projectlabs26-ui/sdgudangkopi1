"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Calendar, LogOut, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface Attendance {
  id: string;
  date: string;
  status: string;
  clock_in: string | null;
  clock_out: string | null;
  clock_in_status: string | null;
}

export default function RekapPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

      const { data } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      setAttendances(data || []);
    }
    loadData();
  }, [supabase, router, currentMonth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const stats = {
    hadir: attendances.filter((a) => a.status === "hadir").length,
    terlambat: attendances.filter((a) => a.status === "terlambat").length,
    sakit: attendances.filter((a) => a.status === "sakit").length,
    izin: attendances.filter((a) => a.status === "izin").length,
    alpa: attendances.filter((a) => a.status === "alpa").length,
  };

  const totalDays = stats.hadir + stats.terlambat + stats.sakit + stats.izin + stats.alpa;
  const percentage = totalDays > 0 ? Math.round(((stats.hadir + stats.terlambat) / totalDays) * 100) : 0;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const prevMonth = () => { setCurrentMonth(new Date(year, month - 1)); };
  const nextMonth = () => { setCurrentMonth(new Date(year, month + 1)); };

  const getStatusIcon = (date: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    const attendance = attendances.find((a) => a.date === dateStr);
    if (!attendance) return null;
    switch (attendance.status) {
      case "hadir": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "terlambat": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "sakit": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "izin": return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "alpa": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            <h1 className="font-poppins font-bold text-primary-600">Rekap Kehadiran</h1>
          </div>
          <p className="text-xs text-gray-500 mb-3">Riwayat absensi Anda</p>
          <div className="flex items-center justify-center space-x-3">
            <a href="/absen" className="text-sm text-primary-500 hover:text-primary-600">← Absensi</a>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 text-center">
          <p className="text-4xl font-bold text-primary-600">{percentage}%</p>
          <p className="text-sm text-gray-500 mb-4">Persentase Kehadiran</p>
          <div className="grid grid-cols-5 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-green-600">{stats.hadir}</p>
              <p className="text-xs text-gray-500">Hadir</p>
            </div>
            <div>
              <p className="text-lg font-bold text-yellow-600">{stats.terlambat}</p>
              <p className="text-xs text-gray-500">Terlambat</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-600">{stats.sakit}</p>
              <p className="text-xs text-gray-500">Sakit</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-600">{stats.izin}</p>
              <p className="text-xs text-gray-500">Izin</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-600">{stats.alpa}</p>
              <p className="text-xs text-gray-500">Alpa</p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-semibold text-gray-900">{monthName}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
              <div key={day} className="py-2 font-medium text-gray-500">{day}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="py-2" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <div key={day} className="py-2 flex flex-col items-center">
                  <span className="text-gray-700">{day}</span>
                  {getStatusIcon(day)}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs text-gray-500">
            <span className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-1" /> Hadir</span>
            <span className="flex items-center"><Clock className="w-3 h-3 text-yellow-500 mr-1" /> Terlambat</span>
            <span className="flex items-center"><XCircle className="w-3 h-3 text-red-500 mr-1" /> Alpa</span>
          </div>
        </div>

        {/* Detail List */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-center">Detail Kehadiran</h3>
          {attendances.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Belum ada data absensi bulan ini</p>
          ) : (
            <div className="space-y-3">
              {attendances.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <p className="font-medium text-gray-900">
                      {new Date(a.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    <p className="text-xs text-gray-500">
                      Masuk: {a.clock_in ? new Date(a.clock_in).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
                      {a.clock_out ? ` | Keluar: ${new Date(a.clock_out).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : ""}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    a.status === "hadir" ? "bg-green-100 text-green-700" :
                    a.status === "terlambat" ? "bg-yellow-100 text-yellow-700" :
                    a.status === "sakit" ? "bg-red-100 text-red-700" :
                    a.status === "izin" ? "bg-orange-100 text-orange-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-6 text-center">
          <a href="/absen" className="text-primary-500 hover:text-primary-600 font-medium">
            ← Kembali ke Absensi
          </a>
        </div>
      </main>
    </div>
  );
}
