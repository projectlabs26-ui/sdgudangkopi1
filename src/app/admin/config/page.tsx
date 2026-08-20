"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Settings,
  MapPin,
  Clock,
  Save,
  Loader2,
  CheckCircle,
  Download,
  User,
  Camera,
} from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";
import Image from "next/image";

interface SchoolConfig {
  id: string;
  school_name: string;
  slogan: string | null;
  vision: string | null;
  mission: string | null;
  history: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  banner_url: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number;
  clock_in_start: string;
  clock_in_end: string;
  clock_out_start: string;
  clock_out_end: string;
  late_tolerance_minutes: number;
  kepsek_photo_url: string | null;
  kepsek_welcome: string | null;
}

export default function AdminConfig() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    const { data } = await supabase.from("school_profile").select("*").single();
    if (data) {
      setConfig(data as SchoolConfig);
      setPhotoPreview(data.kepsek_photo_url || null);
      setLogoPreview(data.logo_url || null);
      setBannerPreview(data.banner_url || null);
    }
    setLoading(false);
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Ukuran foto maksimal 3MB");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;
    const fileName = `kepsek/${Date.now()}_kepsek.jpg`;
    const { error } = await supabase.storage.from("avatars").upload(fileName, photoFile, { upsert: true });
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;
    const ext = logoFile.name.split(".").pop() || "png";
    const fileName = `logo/logo_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("school-media").upload(fileName, logoFile, { upsert: true });
    if (error) { console.error("Upload logo error:", error); return null; }
    const { data } = supabase.storage.from("school-media").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const uploadBanner = async (): Promise<string | null> => {
    if (!bannerFile) return null;
    const ext = bannerFile.name.split(".").pop() || "jpg";
    const fileName = `banner/banner_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("school-media").upload(fileName, bannerFile, { upsert: true });
    if (error) { console.error("Upload banner error:", error); return null; }
    const { data } = supabase.storage.from("school-media").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);

    let photoUrl = config.kepsek_photo_url;
    if (photoFile) photoUrl = await uploadPhoto();

    let logoUrl = config.logo_url;
    if (logoFile) logoUrl = await uploadLogo();

    let bannerUrl = config.banner_url;
    if (bannerFile) bannerUrl = await uploadBanner();

    await supabase
      .from("school_profile")
      .update({
        school_name: config.school_name,
        slogan: config.slogan,
        vision: config.vision,
        mission: config.mission,
        history: config.history,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        address: config.address,
        phone: config.phone,
        email: config.email,
        latitude: config.latitude,
        longitude: config.longitude,
        radius_meters: config.radius_meters,
        clock_in_start: config.clock_in_start,
        clock_in_end: config.clock_in_end,
        clock_out_start: config.clock_out_start,
        clock_out_end: config.clock_out_end,
        late_tolerance_minutes: config.late_tolerance_minutes,
        kepsek_photo_url: photoUrl,
        kepsek_welcome: config.kepsek_welcome,
      })
      .eq("id", config.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Settings className="w-6 h-6 text-primary-500" />
            <h1 className="font-poppins font-bold text-primary-600 text-lg">Konfigurasi Sekolah</h1>
          </div>
          <p className="text-sm text-gray-500 mb-4">Pengaturan profil & absensi</p>
          <div className="flex items-center justify-center space-x-3">
            <a href="/admin/dashboard" className="text-sm text-primary-500 hover:text-primary-600">← Dashboard</a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Logo & Banner */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-poppins font-semibold text-lg mb-4 text-center flex items-center justify-center">
            🎨 Identitas Visual
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Logo Sekolah</label>
              <div
                onClick={() => logoInputRef.current?.click()}
                className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors overflow-hidden bg-gray-50"
              >
                {logoPreview ? (
                  <Image src={logoPreview} alt="Logo" width={128} height={128} className="object-contain" />
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-xs">Upload Logo</span>
                  </div>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) { alert("Ukuran logo maksimal 2MB"); return; }
                  setLogoFile(file);
                  const reader = new FileReader();
                  reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }}
                className="hidden"
              />
              <p className="text-xs text-gray-400 text-center mt-2">Rekomendasi: PNG, 200x200px</p>
            </div>

            {/* Banner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Banner Hero</label>
              <div
                onClick={() => bannerInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors overflow-hidden bg-gray-50"
              >
                {bannerPreview ? (
                  <Image src={bannerPreview} alt="Banner" width={400} height={128} className="object-cover w-full h-full" />
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-xs">Upload Banner</span>
                  </div>
                )}
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) { alert("Ukuran banner maksimal 5MB"); return; }
                  setBannerFile(file);
                  const reader = new FileReader();
                  reader.onload = (ev) => setBannerPreview(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }}
                className="hidden"
              />
              <p className="text-xs text-gray-400 text-center mt-2">Rekomendasi: JPG, 1200x400px</p>
            </div>
          </div>
        </div>

        {/* Sejarah Sekolah */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-poppins font-semibold text-lg mb-4 text-center">📜 Sejarah Sekolah</h2>
          <textarea
            value={config.history || ""}
            onChange={(e) => setConfig({ ...config, history: e.target.value })}
            rows={6}
            placeholder="Tulis sejarah singkat sekolah..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
          />
        </div>

        {/* Kepala Sekolah */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-poppins font-semibold text-lg mb-4 text-center flex items-center justify-center">
            <User className="w-5 h-5 mr-2 text-primary-500" />
            Kepala Sekolah
          </h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors overflow-hidden mx-auto"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Kepsek" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-xs">Upload Foto</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <p className="text-xs text-gray-400 mt-1 text-center">Maks 3MB</p>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sambutan Kepala Sekolah</label>
              <textarea
                value={config.kepsek_welcome || ""}
                onChange={(e) => setConfig({ ...config, kepsek_welcome: e.target.value })}
                rows={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="Tulis sambutan kepala sekolah di sini..."
              />
              <p className="text-xs text-gray-400 mt-1">Teks ini akan ditampilkan di halaman depan</p>
            </div>
          </div>
        </div>

        {/* Profil Sekolah */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-poppins font-semibold text-lg mb-4 text-center flex items-center justify-center">
            <Settings className="w-5 h-5 mr-2 text-primary-500" />
            Profil Sekolah
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah *</label>
              <input type="text" value={config.school_name} onChange={(e) => setConfig({ ...config, school_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
              <input type="text" value={config.slogan || ""} onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                placeholder="Contoh: Mencerdaskan Generasi Bangsa"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visi</label>
              <textarea value={config.vision || ""} onChange={(e) => setConfig({ ...config, vision: e.target.value })} rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Misi</label>
              <textarea value={config.mission || ""} onChange={(e) => setConfig({ ...config, mission: e.target.value })} rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <input type="text" value={config.address || ""} onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                <input type="text" value={config.phone || ""} onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={config.email || ""} onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Lokasi & GPS */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-poppins font-semibold text-lg mb-4 text-center flex items-center justify-center">
            <MapPin className="w-5 h-5 mr-2 text-green-500" />
            Lokasi & Geolokasi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input type="number" step="any" value={config.latitude || ""} onChange={(e) => setConfig({ ...config, latitude: parseFloat(e.target.value) || null })}
                placeholder="-6.2088" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input type="number" step="any" value={config.longitude || ""} onChange={(e) => setConfig({ ...config, longitude: parseFloat(e.target.value) || null })}
                placeholder="106.8456" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Radius Toleransi (meter)</label>
              <input type="number" value={config.radius_meters} onChange={(e) => setConfig({ ...config, radius_meters: parseInt(e.target.value) || 100 })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Toleransi Keterlambatan (menit)</label>
              <input type="number" value={config.late_tolerance_minutes} onChange={(e) => setConfig({ ...config, late_tolerance_minutes: parseInt(e.target.value) || 15 })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Jam Kerja */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-poppins font-semibold text-lg mb-4 text-center flex items-center justify-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-500" />
            Jam Kerja
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk Mulai</label>
              <input type="time" value={config.clock_in_start} onChange={(e) => setConfig({ ...config, clock_in_start: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk Selesai</label>
              <input type="time" value={config.clock_in_end} onChange={(e) => setConfig({ ...config, clock_in_end: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Keluar Mulai</label>
              <input type="time" value={config.clock_out_start} onChange={(e) => setConfig({ ...config, clock_out_start: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Keluar Selesai</label>
              <input type="time" value={config.clock_out_end} onChange={(e) => setConfig({ ...config, clock_out_end: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-poppins font-semibold text-lg mb-4 text-center flex items-center justify-center">
            <Download className="w-5 h-5 mr-2 text-purple-500" />
            Export Data (Excel)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a href={`/api/export?type=attendance&month=${new Date().toISOString().slice(0, 7)}`}
              className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-medium">
              <Download className="w-5 h-5 mr-2" />Export Absensi
            </a>
            <a href="/api/export?type=teachers"
              className="flex items-center justify-center px-4 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-medium">
              <Download className="w-5 h-5 mr-2" />Export Guru
            </a>
            <a href="/api/export?type=students"
              className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-medium">
              <Download className="w-5 h-5 mr-2" />Export Siswa
            </a>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50">
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {saved ? "Tersimpan!" : "Simpan Pengaturan"}
          </button>
        </div>
      </main>
    </div>
  );
}
