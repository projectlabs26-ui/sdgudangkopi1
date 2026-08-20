"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCamera } from "@/hooks/useCamera";
import { useGeolocation } from "@/hooks/useGeolocation";
import {
  Camera,
  MapPin,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AbsenScanPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schoolConfig, setSchoolConfig] = useState({ lat: -6.2088, lng: 106.8456, radius: 100 });

  const {
    videoRef,
    canvasRef,
    isActive,
    photo,
    startCamera,
    stopCamera,
    takePhoto,
    resetPhoto,
  } = useCamera();

  const {
    location,
    error: geoError,
    loading: geoLoading,
    distance,
    isInRange,
    getCurrentPosition,
  } = useGeolocation(schoolConfig.lat, schoolConfig.lng, schoolConfig.radius);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Fetch school config for geolocation
      const { data: config } = await supabase
        .from("school_profile")
        .select("latitude, longitude, radius_meters")
        .single();
      if (config) {
        setSchoolConfig({
          lat: config.latitude || -6.2088,
          lng: config.longitude || 106.8456,
          radius: config.radius_meters || 100,
        });
      }

      // Check if already clocked in today
      const today = new Date().toISOString().split("T")[0];
      const { data: attendance } = await supabase
        .from("attendances")
        .select("clock_in, clock_out")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (attendance?.clock_in && attendance?.clock_out) {
        router.push("/absen");
      }
    }
    checkAuth();
  }, [supabase, router]);

  const handleSubmit = async () => {
    if (!photo || !location || !isInRange) return;

    setSubmitting(true);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];
      const { data: attendance } = await supabase
        .from("attendances")
        .select("clock_in")
        .eq("user_id", user?.id)
        .eq("date", today)
        .single();

      const type = attendance?.clock_in ? "clock_out" : "clock_in";

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selfieDataUrl: photo,
          latitude: location.latitude,
          longitude: location.longitude,
          type,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan absensi");

      router.push(`/absen/success?type=${type}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push("/absen")} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="font-poppins font-bold text-primary-600">Absensi</h1>
            <p className="text-xs text-gray-500">{dateStr}</p>
          </div>
          <div className="w-5" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Camera Preview */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900 text-center flex items-center justify-center">
              <Camera className="w-5 h-5 mr-2 text-primary-500" />
              Selfie Absensi
            </h3>
          </div>
          <div className="relative bg-black min-h-[300px] flex items-center justify-center">
            {!isActive && !photo && (
              <div className="text-center p-8">
                <Camera className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Klik tombol di bawah untuk membuka kamera</p>
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                >
                  Buka Kamera
                </button>
              </div>
            )}
            {isActive && !photo && (
              <div className="relative w-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-b-xl transform -scale-x-100"
                />
                <button
                  onClick={takePhoto}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary-500 rounded-full" />
                </button>
              </div>
            )}
            {photo && (
              <div className="relative w-full">
                <img src={photo} alt="Selfie" className="w-full rounded-b-xl" />
                <button
                  onClick={() => { resetPhoto(); startCamera(); }}
                  className="absolute top-2 right-2 bg-white/80 p-2 rounded-full hover:bg-white"
                >
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-center flex items-center justify-center">
            <MapPin className="w-5 h-5 mr-2 text-green-500" />
            Lokasi Anda
          </h3>
          {!location && !geoError && (
            <button
              onClick={getCurrentPosition}
              disabled={geoLoading}
              className="w-full p-4 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              {geoLoading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Mendapatkan lokasi...</>
              ) : (
                <><MapPin className="w-5 h-5 mr-2" /> Ambil Lokasi Saya</>
              )}
            </button>
          )}
          {geoError && (
            <div className="p-3 bg-red-50 rounded-xl text-red-600 text-sm flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              {geoError}
            </div>
          )}
          {location && (
            <div className={`p-4 rounded-xl text-center ${isInRange ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex items-center justify-center space-x-2 mb-2">
                {isInRange ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`font-semibold ${isInRange ? "text-green-700" : "text-red-700"}`}>
                  {isInRange ? "✅ Dalam area sekolah" : "❌ Di luar area sekolah"}
                </span>
                <button onClick={getCurrentPosition} className="text-gray-400 hover:text-gray-600">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Jarak: {distance}m dari sekolah • Waktu: {timeStr} WIB
              </p>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!photo || !location || !isInRange || submitting}
          className="w-full py-4 bg-primary-500 text-white font-semibold rounded-2xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
        >
          {submitting ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menyimpan...</>
          ) : (
            <>📸 Absen Sekarang</>
          )}
        </button>

        <div className="text-center text-sm text-gray-400 pb-4">
          <p>✅ Pastikan foto terlihat jelas</p>
          <p>✅ Pastikan lokasi dalam area sekolah</p>
        </div>
      </main>
    </div>
  );
}