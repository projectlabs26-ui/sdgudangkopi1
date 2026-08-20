import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, ArrowRight, Search, Filter } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  published_at: string;
}

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const supabase = createClient();

  const category = searchParams.category || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 6;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("news")
    .select("id, title, slug, excerpt, image_url, category, published_at", { count: "exact" })
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data: news, count } = await query.range(offset, offset + limit - 1);

  const beritaList = (news || []) as NewsItem[];
  const totalPages = Math.ceil((count || 0) / limit);

  const categories = [
    { value: "", label: "Semua" },
    { value: "pengumuman", label: "Pengumuman" },
    { value: "berita", label: "Berita" },
    { value: "kegiatan", label: "Kegiatan" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
            📢 Informasi & Kabar
          </span>
          <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Berita & Pengumuman
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-sm sm:text-base">
            Ikuti perkembangan terbaru dan pengumuman penting dari SDN Gudang Kopi 1.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                href={cat.value ? `/berita?category=${cat.value}` : "/berita"}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat.value
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Berita Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {beritaList.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">📭</span>
              <h3 className="font-poppins text-xl font-semibold text-gray-900 mb-2">
                Belum ada berita
              </h3>
              <p className="text-gray-500">
                Belum ada berita dalam kategori ini. Silakan cek lagi nanti.
              </p>
              <Link
                href="/berita"
                className="inline-block mt-4 text-primary-500 hover:text-primary-600 font-medium"
              >
                ← Lihat semua berita
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {beritaList.map((berita) => (
                <article
                  key={berita.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  {/* Image */}
                  <Link href={`/berita/${berita.slug}`}>
                    <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden">
                      {berita.image_url ? (
                        <Image
                          src={berita.image_url}
                          alt={berita.title}
                          width={400}
                          height={192}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-6xl">📰</span>
                      )}
                    </div>
                  </Link>

                  <div className="p-5">
                    {/* Category */}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
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
                    <Link href={`/berita/${berita.slug}`}>
                      <h3 className="font-poppins font-semibold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-primary-500 transition-colors">
                        {berita.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {berita.excerpt || "Tidak ada ringkasan"}
                    </p>

                    {/* Date & Read More */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(berita.published_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <Link
                        href={`/berita/${berita.slug}`}
                        className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center"
                      >
                        Baca
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-10 space-x-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const searchParams = new URLSearchParams();
                if (category) searchParams.set("category", category);
                if (pageNum > 1) searchParams.set("page", String(pageNum));
                const query = searchParams.toString();
                return (
                  <Link
                    key={pageNum}
                    href={`/berita${query ? `?${query}` : ""}`}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                      pageNum === page
                        ? "bg-primary-500 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}