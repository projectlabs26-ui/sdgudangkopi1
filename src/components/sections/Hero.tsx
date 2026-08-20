import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero1.jpg"
          alt="SDN Gudang Kopi 1"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay gelap biar teks terbaca */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/70 to-primary-700/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.png"
              alt="Logo SDN Gudang Kopi 1"
              width={96}
              height={96}
              className="object-contain"
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          SDN Gudang Kopi 1
        </h1>

        {/* Slogan */}
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto">
          &ldquo;Mencerdaskan Generasi Bangsa&rdquo;
        </p>

        {/* Description */}
        <p className="text-white/70 text-sm sm:text-base max-w-lg mx-auto mb-10">
          Sekolah Dasar Negeri Gudang Kopi 1 — Berkomitmen memberikan pendidikan
          berkualitas untuk generasi penerus bangsa.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/berita"
            className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            📢 Lihat Pengumuman
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl border-2 border-white/30 text-sm sm:text-base"
          >
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Login Guru
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}