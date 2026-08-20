import { createClient } from "@/lib/supabase/server";
import { MapPin, Phone, Mail, Globe } from "lucide-react";

interface SchoolProfile {
  school_name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}

export default async function Kontak() {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("school_profile")
    .select("school_name, address, phone, email, website")
    .single();

  const school = profile as SchoolProfile | null;

  const address = school?.address || "Jl. Raya Gudang Kopi, Desa Gudang Kopi, Kecamatan Cikembar, Kabupaten Sukabumi, Jawa Barat";
  const phone = school?.phone || "0812-3456-7890";
  const email = school?.email || "info@sdgudangkopi1.my.id";
  const schoolName = school?.school_name || "SDN Gudang Kopi 1";

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
  ];

  return (
    <section className="py-12 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block px-3 py-1 sm:px-4 sm:py-1 bg-primary-100 text-primary-600 rounded-full text-xs sm:text-sm font-medium mb-4">
            📍 Kontak & Lokasi
          </span>
          <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Hubungi Kami
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Punya pertanyaan? Jangan ragu untuk menghubungi kami melalui kontak di bawah ini.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Info */}
          <div className="space-y-4 sm:space-y-6">
            {contactItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex items-center"
              >
                <div className={`${item.bg} rounded-xl p-3 mr-4`}>
                  <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">{item.label}</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Google Maps Embed */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-72 sm:h-80 lg:h-full min-h-[300px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.0!2d106.8456!3d-6.2088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMzEuNyJTIDEwNsKwNTAnNDQuMiJF!5e0!3m2!1sen!2sid!4v1620000000000!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Lokasi ${schoolName}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}