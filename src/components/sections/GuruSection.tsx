import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

interface Teacher {
  id: string;
  subject: string | null;
  photo_url: string | null;
  users: {
    full_name: string;
  };
}

export default async function GuruSection() {
  const supabase = createClient();

  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, subject, photo_url, users(full_name)")
    .eq("is_active", true)
    .order("display_order");

  const guruList = (teachers || []) as unknown as Teacher[];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-4">
            👨‍🏫 Tenaga Pendidik
          </span>
          <h2 className="font-poppins text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Daftar Guru
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Guru-guru profesional dan berdedikasi yang siap mendidik generasi
            bangsa.
          </p>
        </div>

        {/* Guru Grid */}
        {guruList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Belum ada data guru</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {guruList.map((guru) => (
              <div
                key={guru.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                {/* Avatar */}
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {guru.photo_url ? (
                    <Image
                      src={guru.photo_url}
                      alt={guru.users?.full_name || "Guru"}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">👨‍🏫</span>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-poppins font-semibold text-gray-900 text-sm mb-1">
                  {guru.users?.full_name}
                </h3>

                {/* Subject */}
                <p className="text-gray-500 text-xs">{guru.subject || "Guru"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
