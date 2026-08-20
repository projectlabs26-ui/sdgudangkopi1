import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  published_at: string;
}

export default async function Berita() {
  const supabase = createClient();

  const { data: news } = await supabase
    .from("news")
    .select("id, title, slug, excerpt, image_url, category, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(3);

  const beritaList = (news || []) as NewsItem[];

  // Fallback jika belum ada berita di database
  const displayBerita = beritaList.length > 0 ? beritaList : [
    {
      id: "1",
      title: "Penerimaan Siswa Baru Tahun Ajaran 2026/2027",
      slug: "ppsdb-2026-2027",
      excerpt: "Pendaftaran siswa baru telah dibuka. Segera daftarkan putra/putri anda!",
      image_url: null,
      category: "pengumuman",
      published_at: "2026-08-15",
    },
    {
      id: "2",
      title: "Kegiatan Peringatan Hari Kemerdekaan RI",
      slug: "hari-kemerdekaan-2026",
      excerpt: "SDN Gudang Kopi 1 mengadakan berbagai lomba dalam rangka peringatan Hari Kemerdekaan RI ke-81.",
      image_url: null,
      category: "kegiatan",
      published_at: "2026-08-17",
    },
    {
      id: "3",
      title: "Prestasi Siswa dalam Olimpiade Sains",
      slug: "prestasi-olimpiade-sains",
      excerpt: "Siswa SDN Gudang Kopi 1 meraih juara dalam Olimpiade Sains Tingkat Kabupaten.",
      image_url: null,
      category: "berita",
      published_at: "2026-08-10",
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block px-3 py-1 sm:px-4 sm:py-1 bg-primary-100 text-primary-600 rounded-full text-xs sm:text-sm font-medium mb-4">
            📢 Berita & Pengumuman
          </span>
          <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Kabar Terbaru
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Ikuti perkembangan terbaru dan pengumuman penting dari SDN Gudang Kopi 1.
          </p>
        </div>

        {/* Berita Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {displayBerita.map((berita) => (
            <article
              key={berita.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Image */}
              <div className="h-36 sm:h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                {berita.image_url ? (
                  <Image
                    src={berita.image_url}
                    alt={berita.title}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl sm:text-6xl">📰</span>
                )}
              </div>

              <div className="p-4 sm:p-6">
                {/* Category Badge */}
                <span
                  className={`inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium mb-2 sm:mb-3 ${
                    berita.category === "pengumuman"
                      ? "bg-yellow-100 text-yellow-700"
                      : berita.category === "kegiatan"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {berita.category}
                </span>

                {/* Title */}
                <h3 className="font-poppins font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2">
                  {berita.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                  {berita.excerpt || "Tidak ada ringkasan"}
                </p>

                {/* Date & Read More */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {new Date(berita.published_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <Link
                    href={`/berita/${berita.slug}`}
                    className="text-primary-500 hover:text-primary-600 font-medium text-xs sm:text-sm flex items-center"
                  >
                    Baca
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-8 sm:mt-12">
          <Link
            href="/berita"
            className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-xl hover:bg-primary-500 hover:text-white transition-colors text-sm sm:text-base"
          >
            Lihat Semua Berita
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
