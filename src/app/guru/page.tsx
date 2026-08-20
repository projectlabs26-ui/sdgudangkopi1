import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, BookOpen } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

interface Teacher {
  id: string;
  subject: string | null;
  photo_url: string | null;
  bio: string | null;
  display_order: number;
  users: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

export default async function GuruPage() {
  const supabase = createClient();

  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, subject, photo_url, bio, display_order, users(full_name, email, phone)")
    .eq("is_active", true)
    .order("display_order");

  const guruList = (teachers || []) as unknown as Teacher[];

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
            👨‍🏫 Tenaga Pendidik
          </span>
          <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Daftar Guru
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-sm sm:text-base">
            Guru-guru profesional dan berdedikasi yang siap mendidik generasi bangsa di SDN Gudang Kopi 1.
          </p>
        </div>
      </section>

      {/* Guru Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {guruList.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">👨‍🏫</span>
              <h3 className="font-poppins text-xl font-semibold text-gray-900 mb-2">
                Belum ada data guru
              </h3>
              <p className="text-gray-500">
                Data guru akan segera diperbarui. Silakan cek lagi nanti.
              </p>
              <Link
                href="/"
                className="inline-block mt-4 text-primary-500 hover:text-primary-600 font-medium"
              >
                ← Kembali ke Beranda
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {guruList.map((guru) => (
                <div
                  key={guru.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  {/* Avatar */}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    {guru.photo_url ? (
                      <Image
                        src={guru.photo_url}
                        alt={guru.users?.full_name || "Guru"}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">👨‍🏫</span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-poppins font-semibold text-gray-900 text-lg mb-1">
                    {guru.users?.full_name}
                  </h3>

                  {/* Subject */}
                  {guru.subject && (
                    <div className="flex items-center justify-center text-sm text-gray-500 mb-3">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {guru.subject}
                    </div>
                  )}

                  {/* Bio */}
                  {guru.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {guru.bio}
                    </p>
                  )}

                  {/* Contact */}
                  <div className="space-y-1 text-sm text-gray-500">
                    {guru.users?.email && (
                      <div className="flex items-center justify-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {guru.users.email}
                      </div>
                    )}
                    {guru.users?.phone && (
                      <div className="flex items-center justify-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {guru.users.phone}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}