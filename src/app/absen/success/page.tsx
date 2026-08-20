"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Clock, MapPin, Calendar, ArrowLeft, Home, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AbsenSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <AbsenSuccessContent />
    </Suspense>
  );
}

function AbsenSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "clock_in";
  const supabase = createClient();

  const [attendance, setAttendance] = useState<{
    clock_in: string | null;
    clock_out: string | null;
    clock_in_lat: number | null;
    clock_in_long: number | null;
    clock_in_status: string | null;
    status: string;
  } | null>(null);

  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .single();
      setUserName(profile?.full_name || "");

      const today = new Date().toISOString().split("T")[0];
      const { data: attendance } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();
      setAttendance(attendance);
    }
    loadData();
  }, [supabase, router]);

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const isOnTime = attendance?.clock_in_status === "tepat_waktu";
  const isLate = attendance?.clock_in_status === "terlambat";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Success Animation */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <h1 className="font-poppins text-2xl font-bold text-gray-900 mb-2">
            {type === "clock_in" ? "Absen Masuk Berhasil!" : "Absen Keluar Berhasil!"}
          </h1>
          <p className="text-gray-500">
            {type === "clock_in"
              ? "Anda telah tercatat hadir hari ini"
              : "Anda telah tercatat pulang hari ini"}
          </p>
        </div>

        {/* Detail Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-left">
          <h3 className="font-poppins font-semibold text-gray-900 mb-4 text-center">
            Detail Absensi
          </h3>

          <div className="space-y-3">
            {/* Name */}
            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-lg">👤</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Nama</p>
                <p className="font-semibold text-gray-900">{userName || "-"}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-primary-500 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Tanggal</p>
                <p className="font-semibold text-gray-900">{dateStr}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-primary-500 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Waktu</p>
                <p className="font-semibold text-gray-900">{timeStr} WIB</p>
              </div>
            </div>

            {/* Location */}
            {attendance?.clock_in_lat && (
              <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Lokasi</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {attendance.clock_in_lat.toFixed(6)}, {attendance.clock_in_long?.toFixed(6)}
                  </p>
                </div>
              </div>
            )}

            {/* Status */}
            {type === "clock_in" && (
              <div className={`flex items-center p-3 rounded-xl ${
                isOnTime ? "bg-green-50" : isLate ? "bg-yellow-50" : "bg-gray-50"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  isOnTime ? "bg-green-100" : isLate ? "bg-yellow-100" : "bg-gray-100"
                }`}>
                  <span className="text-lg">{isOnTime ? "✅" : isLate ? "⚠️" : "📋"}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`font-semibold ${
                    isOnTime ? "text-green-700" : isLate ? "text-yellow-700" : "text-gray-700"
                  }`}>
                    {isOnTime ? "Tepat Waktu" : isLate ? "Terlambat" : attendance?.status || "-"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/absen"
            className="block w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
          >
            Kembali ke Dashboard
          </Link>
          <Link
            href="/"
            className="block w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}