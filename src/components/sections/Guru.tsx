import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Sample data - akan diganti dari database
const sampleGuru = [
  {
    id: 1,
    name: "Pak Budi Santoso",
    subject: "Wali Kelas 3A - Matematika",
    photo: "/images/guru-1.jpg",
  },
  {
    id: 2,
    name: "Bu Sari Dewi",
    subject: "Wali Kelas 3B - Bahasa Indonesia",
    photo: "/images/guru-2.jpg",
  },
  {
    id: 3,
    name: "Pak Ahmad Fauzi",
    subject: "PJOK",
    photo: "/images/guru-3.jpg",
  },
  {
    id: 4,
    name: "Bu Rina Wati",
    subject: "Agama Islam",
    photo: "/images/guru-4.jpg",
  },
  {
    id: 5,
    name: "Pak Joko Pratama",
    subject: "Seni Budaya",
    photo: "/images/guru-5.jpg",
  },
  {
    id: 6,
    name: "Bu Maya Putri",
    subject: "Bahasa Inggris",
    photo: "/images/guru-6.jpg",
  },
];

export default function Guru() {
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {sampleGuru.map((guru) => (
            <div
              key={guru.id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center group"
            >
              {/* Avatar */}
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                <span className="text-3xl">👨‍🏫</span>
              </div>

              {/* Name */}
              <h3 className="font-poppins font-semibold text-gray-900 text-sm mb-1">
                {guru.name}
              </h3>

              {/* Subject */}
              <p className="text-gray-500 text-xs">{guru.subject}</p>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link
            href="/guru"
            className="inline-flex items-center px-6 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-xl hover:bg-primary-500 hover:text-white transition-colors"
          >
            Lihat Semua Guru
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
