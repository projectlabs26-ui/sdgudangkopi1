import { createClient } from "@/lib/supabase/server";

interface SchoolProfile {
  vision: string | null;
  mission: string | null;
}

export default async function VisiMisi() {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("school_profile")
    .select("vision, mission")
    .single();

  const school = profile as SchoolProfile | null;

  const defaultVision = "Menjadi sekolah unggul yang menghasilkan generasi berprestasi, berakhlak mulia, dan berwawasan global berdasarkan nilai-nilai Pancasila.";

  const defaultMission = [
    "Melaksanakan pembelajaran yang aktif, kreatif, efektif, dan menyenangkan.",
    "Mengembangkan potensi siswa secara optimal dalam bidang akademik dan non-akademik.",
    "Menanamkan nilai-nilai keimanan, ketakwaan, dan akhlak mulia.",
    "Menciptakan lingkungan sekolah yang bersih, sehat, dan nyaman.",
    "Membangun kemitraan yang harmonis antara sekolah, orang tua, dan masyarakat.",
  ];

  const missionItems = school?.mission
    ? school.mission
        .split("\n")
        .map((m) => m.replace(/^\d+\.\s*/, "").trim())
        .filter((m) => m.length > 0)
    : defaultMission;

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block px-3 py-1 sm:px-4 sm:py-1 bg-primary-100 text-primary-600 rounded-full text-xs sm:text-sm font-medium mb-4">
            🎯 Visi & Misi
          </span>
          <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Visi & Misi Sekolah
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Visi */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-2xl sm:text-3xl mr-3">🔭</span>
              <h3 className="font-poppins text-xl sm:text-2xl font-bold">Visi</h3>
            </div>
            <blockquote className="text-base sm:text-lg leading-relaxed italic border-l-4 border-white/40 pl-4">
              &ldquo;{school?.vision || defaultVision}&rdquo;
            </blockquote>
          </div>

          {/* Misi */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <span className="text-2xl sm:text-3xl mr-3">📋</span>
              <h3 className="font-poppins text-xl sm:text-2xl font-bold text-gray-900">Misi</h3>
            </div>
            <ol className="space-y-3">
              {missionItems.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 text-sm sm:text-base">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}