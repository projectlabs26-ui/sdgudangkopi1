import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ArrowLeft, Share2, User } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

interface NewsDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category: string;
  is_published: boolean;
  published_at: string;
  created_by: string | null;
  users: {
    full_name: string;
  } | null;
}

export default async function BeritaDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: berita } = await supabase
    .from("news")
    .select("*, users(full_name)")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!berita) {
    notFound();
  }

  const news = berita as unknown as NewsDetail;

  // Get related news (same category, excluding current)
  const { data: related } = await supabase
    .from("news")
    .select("id, title, slug, image_url, category, published_at")
    .eq("is_published", true)
    .eq("category", news.category)
    .neq("id", news.id)
    .order("published_at", { ascending: false })
    .limit(3);

  const relatedNews = (related || []) as NewsDetail[];

  // Format content with markdown-like parsing
  const formatContent = (text: string) => {
    return text
      .split("\n")
      .map((line) => {
        if (line.startsWith("# ")) {
          return `<h3 class="font-poppins font-semibold text-xl text-gray-900 mt-6 mb-3">${line.slice(2)}</h3>`;
        }
        if (line.startsWith("## ")) {
          return `<h3 class="font-poppins font-semibold text-lg text-gray-900 mt-5 mb-2">${line.slice(3)}</h3>`;
        }
        if (line.startsWith("- ")) {
          return `<li class="ml-4 mb-1 text-gray-700">${line.slice(2)}</li>`;
        }
        if (line.trim() === "") {
          return "<br>";
        }
        // Bold, italic
        let formatted = line
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/_(.*?)_/g, "<em>$1</em>");
        return `<p class="text-gray-700 leading-relaxed mb-2">${formatted}</p>`;
      })
      .join("");
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-20 pb-4 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center text-sm text-gray-500 space-x-2">
            <Link href="/" className="hover:text-primary-500">Beranda</Link>
            <span>/</span>
            <Link href="/berita" className="hover:text-primary-500">Berita</Link>
            <span>/</span>
            <span className="text-gray-900 truncate">{news.title}</span>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Category Badge */}
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
              news.category === "pengumuman"
                ? "bg-yellow-100 text-yellow-700"
                : news.category === "kegiatan"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {news.category}
          </span>

          <h1 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {news.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(news.published_at).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            {news.users && (
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {news.users.full_name}
              </div>
            )}
          </div>

          {/* Featured Image */}
          {news.image_url && (
            <div className="rounded-2xl overflow-hidden mb-8">
              <Image
                src={news.image_url}
                alt={news.title}
                width={800}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: news.content
                ? formatContent(news.content)
                : news.excerpt || "Tidak ada konten",
            }}
          />

          {/* Share Button */}
          <div className="mt-8 pt-6 border-t flex items-center justify-between">
            <Link
              href="/berita"
              className="flex items-center text-primary-500 hover:text-primary-600 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali ke Berita
            </Link>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.share?.({
                    title: news.title,
                    url: window.location.href,
                  }).catch(() => {});
                }
              }}
              className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Bagikan
            </button>
          </div>
        </div>
      </section>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="font-poppins text-xl font-bold text-gray-900 mb-6">
              Berita Terkait
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/berita/${item.slug}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        width={300}
                        height={128}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-3xl">📰</span>
                    )}
                  </div>
                  <div className="p-3">
                    <span className="text-xs text-gray-500">
                      {new Date(item.published_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <p className="font-medium text-gray-900 text-sm line-clamp-2 mt-1 group-hover:text-primary-500 transition-colors">
                      {item.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}