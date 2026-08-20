import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

interface SchoolProfile {
  school_name: string;
  vision: string | null;
  mission: string | null;
  kepsek_photo_url: string | null;
  kepsek_welcome: string | null;
}

interface KepsekUser {
  full_name: string;
  avatar_url: string | null;
}

export default async function KepsekSection() {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("school_profile")
    .select("school_name, vision, mission, kepsek_photo_url, kepsek_welcome")
    .single();

  const { data: kepsekUser } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("role", "kepala_sekolah")
    .single();

  const school = profile as SchoolProfile | null;
  const kepsek = kepsekUser as KepsekUser | null;

  const photoUrl = school?.kepsek_photo_url || kepsek?.avatar_url;

  const defaultWelcome = `Assalamualaikum Warahmatullahi Wabarakatuh.

Puji syukur kita panjatkan ke hadirat Tuhan Yang Maha Esa atas segala rahmat dan karunia-Nya sehingga kita dapat melaksanakan kegiatan dengan baik.

Kami mengucapkan selamat datang di website resmi ${school?.school_name || "SDN Gudang Kopi 1"}. Melalui website ini, kami berharap dapat memberikan informasi yang akurat dan terkini kepada seluruh warga sekolah dan masyarakat.

Mari kita bersama-sama mendidik generasi penerus bangsa yang cerdas, berkarakter, dan berprestasi.`;

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Foto Kepsek */}
          <div className="flex justify-center order-1 lg:order-1">
            <div className="relative">
              <div className="w-40 h-52 sm:w-56 sm:h-72 lg:w-64 lg:h-80 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt="Kepala Sekolah"
                    width={256}
                    height={320}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-6xl sm:text-7xl lg:text-8xl">🧑‍💼</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-16 h-16 sm:w-24 sm:h-24 bg-primary-500 rounded-2xl -z-10" />
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-12 h-12 sm:w-16 sm:h-16 bg-primary-200 rounded-xl -z-10" />
            </div>
          </div>

          {/* Sambutan */}
          <div className="order-2 lg:order-2">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1 bg-primary-100 text-primary-600 rounded-full text-xs sm:text-sm font-medium mb-4">
              🎤 Sambutan Kepala Sekolah
            </span>
            <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Selamat Datang di {school?.school_name || "SDN Gudang Kopi 1"}
            </h2>
            <blockquote className="text-base sm:text-lg text-gray-600 italic border-l-4 border-primary-500 pl-4 mb-6 whitespace-pre-line">
              &ldquo;{school?.kepsek_welcome || defaultWelcome}&rdquo;
            </blockquote>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt="Kepsek"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg sm:text-xl">🧑‍💼</span>
                )}
              </div>
              <div>
                <p className="font-poppins font-semibold text-gray-900 text-sm sm:text-base">
                  {kepsek?.full_name || "Kepala Sekolah"}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">Kepala Sekolah</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
