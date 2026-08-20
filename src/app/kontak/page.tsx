import { createClient } from "@/lib/supabase/server";
import { MapPin, Phone, Mail, Globe, Clock } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

interface SchoolProfile {
  school_name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  clock_in_start: string;
  clock_in_end: string;
  clock_out_start: string;
  clock_out_end: string;
}

export default async function KontakPage() {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("school_profile")
    .select("*")
    .single();

  const school = profile as SchoolProfile | null;

  const address = school?.address || "Jl. Raya Gudang Kopi, Desa Gudang Kopi, Kecamatan Cikembar, Kabupaten Sukabumi, Jawa Barat";
  const phone = school?.phone || "0812-3456-7890";
  const email = school?.email || "info@sdgudangkopi1.my.id";
  const schoolName = school?.school_name || "SDN Gudang Kopi 1";
  const lat = school?.latitude || -6.2088;
  const lng = school?.longitude || 106.8456;

  const contactItems = [
    {
      icon: MapPin,
      label: "Alamat",
      value: address,
      color: "text-red-500",
      bg: "bg-red-100",
    },
    {
      icon: Phone,
      label: "Telepon",
      value: phone,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      icon: Mail,
      label: "Email",
      value: email,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    {
      icon: Globe,
      label: "Website",
      value: "sdgudangkopi1.my.id",
      color: "text-purple-500",
      bg: "bg-purple-100",
    },
    {
      icon: Clock,
      label: "Jam Operasional",
      value: `Senin - Jumat: ${school?.clock_in_start || "07:00"} - ${school?.clock_out_end || "16:00"} WIB`,
      color: "text-orange-500",
      bg: "bg-orange-100",
    },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
            📍 Hubungi Kami
          </span>
          <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Kontak & Lokasi
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-sm sm:text-base">
            Punya pertanyaan? Jangan ragu untuk menghubungi kami melalui kontak di bawah ini.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <h2 className="font-poppins text-2xl font-bold text-gray-900 mb-2">
                {schoolName}
              </h2>
              <p className="text-gray-600 mb-6">
                Silakan hubungi kami melalui informasi kontak di bawah ini. Kami siap melayani Anda.
              </p>

              {contactItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start"
                >
                  <div className={`${item.bg} rounded-xl p-3 mr-4 flex-shrink-0`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="font-semibold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-[400px] lg:h-full min-h-[400px]">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.0!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMzEuNyJTIDEwNsKwNTAnNDQuMiJF!5e0!3m2!1sen!2sid!4v1620000000000!5m2!1sen!2sid`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Lokasi ${schoolName}`}
                />
              </div>

              {/* Tombol Navigasi */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
              >
                🗺️ Buka di Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}