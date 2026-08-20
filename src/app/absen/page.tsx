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
  CheckCircle,
  LogOut,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  FileText,
  Upload,
  X,
  Stethoscope,
  ClipboardList,
} from "lucide-react";

export default function AbsenPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [todayData, setTodayData] = useState<{ id: string; clock_in: string | null; clock_out: string | null; status: string; note: string | null; proof_image_url: string | null } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [absenType, setAbsenType] = useState<"clock_in" | "clock_out">("clock_in");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ status: "sakit", date: "", note: "" });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [reportSaving, setReportSaving] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const [schoolConfig, setSchoolConfig] = useState({ lat: -6.2088, lng: 106.8456, radius: 100 });

  const { videoRef, canvasRef, isActive, photo, startCamera, stopCamera, takePhoto, resetPhoto } = useCamera();
  const { location, error: geoError, loading: geoLoading, distance, isInRange, getCurrentPosition } = useGeolocation(schoolConfig.lat, schoolConfig.lng, schoolConfig.radius);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser({ id: user.id, email: user.email || "" });

      const { data: profile } = await supabase
        .from("users")
        .select("full_name, role")
        .eq("id", user.id)
        .single();
      setProfile(profile);

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

      const today = new Date().toISOString().split("T")[0];
      const { data: attendance } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();
      setTodayData(attendance);

      if (attendance?.clock_in && !attendance?.clock_out) {
        setAbsenType("clock_out");
      }
    }
    loadData();
  }, [supabase, router]);

  const handleAbsen = async () => {
    if (!photo || !location) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selfieDataUrl: photo,
          latitude: location.latitude,
          longitude: location.longitude,
          type: absenType,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan absensi");
      setSuccess(true);
      setTodayData(data.attendance);
      setTimeout(() => { router.refresh(); }, 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const openReportModal = (status: "sakit" | "izin") => {
    const today = new Date().toISOString().split("T")[0];
    setReportForm({ status, date: today, note: "" });
    setProofFile(null);
    setProofPreview(null);
    setReportSuccess(false);
    setShowReportModal(true);
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleReportSubmit = async () => {
    if (!reportForm.date) return;
    setReportSaving(true);
    try {
      const formData = new FormData();
      formData.append("status", reportForm.status);
      formData.append("date", reportForm.date);
      formData.append("note", reportForm.note);
      if (proofFile) formData.append("proof", proofFile);

      const res = await fetch("/api/attendance/report", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan laporan");

      setReportSuccess(true);
      setTodayData(data.attendance);
      setTimeout(() => {
        setShowReportModal(false);
        router.refresh();
      }, 1500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setReportSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-xl">🏫</span>
            <h1 className="font-poppins font-bold text-primary-600">SDN Gudang Kopi 1</h1>
          </div>
          <p className="text-xs text-gray-500 mb-3">Dashboard Absensi</p>
          <div className="flex items-center justify-center space-x-3">
            <a href="/rekap" className="text-gray-400 hover:text-primary-500">
              <Calendar className="w-5 h-5" />
            </a>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* User Info */}
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-xl">👨‍🏫</span>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{profile?.full_name || user.email}</p>
            <p className="text-sm text-gray-500">{today} • {time}</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-semibold text-green-700">Absensi Berhasil!</p>
            <p className="text-sm text-green-600">
              {absenType === "clock_in" ? "Absen masuk" : "Absen keluar"} tercatat.
            </p>
          </div>
        )}

        {/* Status Hari Ini */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 text-center">Status Hari Ini</h3>

          {/* Sakit / Izin Banner */}
          {(todayData?.status === "sakit" || todayData?.status === "izin") && (
            <div className={`rounded-xl p-4 mb-3 text-center ${
              todayData.status === "sakit" ? "bg-yellow-50 border border-yellow-200" : "bg-blue-50 border border-blue-200"
            }`}>
              <p className="text-2xl mb-1">{todayData.status === "sakit" ? "🤒" : "📋"}</p>
              <p className={`font-semibold ${
                todayData.status === "sakit" ? "text-yellow-700" : "text-blue-700"
              }`}>
                {todayData.status === "sakit" ? "Sakit" : "Izin"}
              </p>
              {todayData.note && (
                <p className="text-sm text-gray-500 mt-1">"{todayData.note}"</p>
              )}
              {todayData.proof_image_url && (
                <a
                  href={todayData.proof_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-primary-500 hover:underline"
                >
                  📎 Lihat bukti
                </a>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl p-3 text-center ${todayData?.clock_in ? "bg-green-50" : "bg-gray-50"}`}>
              <Clock className={`w-6 h-6 mx-auto mb-1 ${todayData?.clock_in ? "text-green-500" : "text-gray-400"}`} />
              <p className="text-xs text-gray-500">Masuk</p>
              <p className="font-semibold text-sm">
                {todayData?.clock_in
                  ? new Date(todayData.clock_in as string).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                  : "Belum"}
              </p>
            </div>
            <div className={`rounded-xl p-3 text-center ${todayData?.clock_out ? "bg-green-50" : "bg-gray-50"}`}>
              <Clock className={`w-6 h-6 mx-auto mb-1 ${todayData?.clock_out ? "text-green-500" : "text-gray-400"}`} />
              <p className="text-xs text-gray-500">Keluar</p>
              <p className="font-semibold text-sm">
                {todayData?.clock_out
                  ? new Date(todayData.clock_out as string).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                  : "Belum"}
              </p>
            </div>
          </div>
        </div>

        {/* Self-Report: Sakit / Izin */}
        {!todayData?.clock_in && !todayData?.clock_out && !success && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">Tidak Bisa Hadir?</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Laporkan jika Anda sakit atau izin hari ini
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => openReportModal("sakit")}
                className="flex items-center justify-center p-3 rounded-xl border-2 border-yellow-300 bg-yellow-50 hover:bg-yellow-100 transition-colors"
              >
                <Stethoscope className="w-5 h-5 mr-2 text-yellow-600" />
                <span className="font-medium text-yellow-700">Sakit</span>
              </button>
              <button
                onClick={() => openReportModal("izin")}
                className="flex items-center justify-center p-3 rounded-xl border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <ClipboardList className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium text-blue-700">Izin</span>
              </button>
            </div>
          </div>
        )}

        {/* Already completed both */}
        {todayData?.clock_in && todayData?.clock_out && !success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-green-700">Absensi Hari Ini Selesai</p>
            <p className="text-sm text-green-600">Anda sudah absen masuk dan keluar hari ini.</p>
          </div>
        )}

        {/* Absen Form */}
        {!todayData?.clock_out && !success && (
          <>
            {/* Absen Type Toggle */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-center">Jenis Absensi</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setAbsenType("clock_in"); resetPhoto(); }}
                  disabled={!!todayData?.clock_in}
                  className={`p-3 rounded-xl border-2 font-medium transition-colors text-center ${
                    absenType === "clock_in"
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 text-gray-500"
                  } ${todayData?.clock_in ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  🟢 Absen Masuk
                </button>
                <button
                  onClick={() => { setAbsenType("clock_out"); resetPhoto(); }}
                  disabled={!todayData?.clock_in || !!todayData?.clock_out}
                  className={`p-3 rounded-xl border-2 font-medium transition-colors text-center ${
                    absenType === "clock_out"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 text-gray-500"
                  } ${!todayData?.clock_in || !!todayData?.clock_out ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  🔴 Absen Keluar
                </button>
              </div>
            </div>

            {/* Lokasi */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-center flex items-center justify-center">
                <MapPin className="w-5 h-5 mr-2" />
                Lokasi
              </h3>
              {!location && !geoError && (
                <button
                  onClick={getCurrentPosition}
                  disabled={geoLoading}
                  className="w-full p-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center"
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
                <div className={`p-3 rounded-xl ${isInRange ? "bg-green-50" : "bg-red-50"}`}>
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`font-semibold ${isInRange ? "text-green-700" : "text-red-700"}`}>
                      {isInRange ? "✅ Dalam area sekolah" : "❌ Di luar area sekolah"}
                    </span>
                    <button onClick={getCurrentPosition} className="text-gray-400 hover:text-gray-600">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 text-center">
                    Jarak: {distance}m dari sekolah
                  </p>
                </div>
              )}
            </div>

            {/* Kamera Selfie */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-center flex items-center justify-center">
                <Camera className="w-5 h-5 mr-2" />
                Selfie
              </h3>
              {!isActive && !photo && (
                <button
                  onClick={startCamera}
                  className="w-full p-4 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Camera className="w-5 h-5 mr-2" /> Buka Kamera
                </button>
              )}
              {isActive && !photo && (
                <div className="relative">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl transform -scale-x-100" />
                  <button
                    onClick={takePhoto}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-primary-500 hover:bg-primary-50"
                  >
                    <div className="w-12 h-12 bg-primary-500 rounded-full" />
                  </button>
                </div>
              )}
              {photo && (
                <div className="relative">
                  <img src={photo} alt="Selfie" className="w-full rounded-xl" />
                  <button onClick={() => { resetPhoto(); startCamera(); }}
                    className="absolute top-2 right-2 bg-white/80 p-2 rounded-full hover:bg-white">
                    <RefreshCw className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAbsen}
              disabled={!photo || !location || !isInRange || submitting}
              className="w-full py-4 bg-primary-500 text-white font-semibold rounded-2xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menyimpan...</>
              ) : (
                <>{absenType === "clock_in" ? "📸 Absen Masuk" : "📸 Absen Keluar"}</>
              )}
            </button>
            <div className="mt-4 text-center text-sm text-gray-400">
              <p>✅ Lokasi dalam area • ✅ Foto selfie • ✅ Klik tombol absen</p>
            </div>
          </>
        )}

        {/* Self-Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-poppins font-semibold text-lg flex items-center">
                    {reportForm.status === "sakit" ? (
                      <><Stethoscope className="w-5 h-5 mr-2 text-yellow-500" /> Lapor Sakit</>
                    ) : (
                      <><ClipboardList className="w-5 h-5 mr-2 text-blue-500" /> Lapor Izin</>
                    )}
                  </h2>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {reportSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="font-semibold text-green-700 text-lg">Laporan Tersimpan!</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {reportForm.status === "sakit" ? "Laporan sakit" : "Laporan izin"} berhasil dicatat.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setReportForm({ ...reportForm, status: "sakit" })}
                            className={`p-2.5 rounded-lg border-2 font-medium text-sm transition-colors ${
                              reportForm.status === "sakit"
                                ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                                : "border-gray-200 text-gray-500"
                            }`}
                          >
                            🤒 Sakit
                          </button>
                          <button
                            type="button"
                            onClick={() => setReportForm({ ...reportForm, status: "izin" })}
                            className={`p-2.5 rounded-lg border-2 font-medium text-sm transition-colors ${
                              reportForm.status === "izin"
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 text-gray-500"
                            }`}
                          >
                            📋 Izin
                          </button>
                        </div>
                      </div>

                      {/* Tanggal */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                        <input
                          type="date"
                          value={reportForm.date}
                          onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      </div>

                      {/* Keterangan */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Keterangan <span className="text-gray-400">(opsional)</span>
                        </label>
                        <textarea
                          value={reportForm.note}
                          onChange={(e) => setReportForm({ ...reportForm, note: e.target.value })}
                          rows={3}
                          placeholder={reportForm.status === "sakit" ? "Contoh: Demam, izin berobat..." : "Contoh: Ada keperluan keluarga..."}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                        />
                      </div>

                      {/* Upload Bukti */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload Bukti <span className="text-gray-400">(opsional, maks 5MB)</span>
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofChange}
                          className="hidden"
                          id="proof-file-input"
                        />
                        <label
                          htmlFor="proof-file-input"
                          className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                        >
                          {proofPreview ? (
                            <div className="text-center">
                              <img
                                src={proofPreview}
                                alt="Preview bukti"
                                className="w-32 h-32 object-cover rounded-lg mx-auto mb-2"
                              />
                              <span className="text-sm text-primary-500">Klik untuk ganti gambar</span>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <span className="text-sm text-gray-500">
                                {reportForm.status === "sakit"
                                  ? "Upload surat dokter / bukti sakit"
                                  : "Upload surat izin / bukti pendukung"}
                              </span>
                              <span className="block text-xs text-gray-400 mt-1">JPG, PNG, WebP</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowReportModal(false)}
                        className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleReportSubmit}
                        disabled={!reportForm.date || reportSaving}
                        className={`flex-1 py-2.5 text-white rounded-lg disabled:opacity-50 flex items-center justify-center ${
                          reportForm.status === "sakit"
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        {reportSaving ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Kirim Laporan
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
