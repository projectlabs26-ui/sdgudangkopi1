import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, BookOpen, Calendar, Settings, BarChart3, Newspaper } from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";
import Image from "next/image";

export default async function AdminDashboard() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || (profile.role !== "admin" && profile.role !== "kepala_sekolah")) {
    redirect("/absen");
  }

  const today = new Date().toISOString().split("T")[0];

  const [teachersRes, classesRes, attendanceRes] = await Promise.all([
    supabase.from("teachers").select("id", { count: "exact", head: true }),
    supabase.from("classes").select("id", { count: "exact", head: true }),
    supabase.from("attendances").select("id", { count: "exact", head: true }).eq("date", today),
  ]);

  const todayStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
            </div>
            <div className="text-center">
              <h1 className="font-poppins font-bold text-primary-600">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">{todayStr}</p>
            </div>
          </div>
          <div className="absolute right-4">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="font-poppins text-2xl font-bold text-gray-900">
            Selamat Datang, {profile?.full_name || "Admin"}
          </h2>
          <p className="text-gray-500">
            Role: {profile?.role === "kepala_sekolah" ? "Kepala Sekolah" : "Admin"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <Users className="w-8 h-8 text-primary-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">{teachersRes.count || 0}</p>
            <p className="text-sm text-gray-500">Guru Aktif</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">{classesRes.count || 0}</p>
            <p className="text-sm text-gray-500">Total Kelas</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <Calendar className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">{attendanceRes.count || 0}</p>
            <p className="text-sm text-gray-500">Hadir Hari Ini</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <BarChart3 className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">SDGK1</p>
            <p className="text-sm text-gray-500">Tahun Ajaran 2025/2026</p>
          </div>
        </div>

        {/* Quick Links */}
        <h3 className="font-poppins font-semibold text-gray-900 mb-4 text-center">Menu Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <a href="/admin/teachers" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow text-center">
            <Users className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Kelola Guru</p>
          </a>
          <a href="/admin/classes" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow text-center">
            <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Kelola Kelas</p>
          </a>
          <a href="/admin/students" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow text-center">
            <Users className="w-8 h-8 text-teal-500 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Kelola Siswa</p>
          </a>
          <a href="/admin/attendance" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow text-center">
            <Calendar className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Rekap Absensi</p>
          </a>
          <a href="/admin/berita" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow text-center">
            <Newspaper className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Kelola Berita</p>
          </a>
          <a href="/admin/config" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow text-center">
            <Settings className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Pengaturan</p>
          </a>
        </div>
      </main>
    </div>
  );
}
