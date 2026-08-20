import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/", label: "Beranda" },
    { href: "/berita", label: "Berita" },
    { href: "/guru", label: "Daftar Guru" },
    { href: "/kontak", label: "Kontak" },
    { href: "/login", label: "Login" },
  ];

  const socialLinks = [
    { href: "#", label: "Facebook", icon: "📘" },
    { href: "#", label: "Instagram", icon: "📷" },
    { href: "#", label: "YouTube", icon: "▶️" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Logo & About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-white text-base">
                  SDN Gudang Kopi 1
                </h3>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Website resmi SDN Gudang Kopi 1. Menyediakan informasi sekolah dan
              layanan absensi online untuk guru.
            </p>
            {/* Social */}
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors"
                >
                  <span className="text-sm">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Menu
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
                  >
                    <ArrowRight className="w-3 h-3 mr-2" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-poppins font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Kontak
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-500" />
                <span>Jl. Raya Gudang Kopi, Desa Gudang Kopi, Sukabumi</span>
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-gray-500" />
                <span>0812-3456-7890</span>
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0 text-gray-500" />
                <span>info@sdgudangkopi1.my.id</span>
              </li>
            </ul>
          </div>

          {/* Jam Operasional */}
          <div>
            <h4 className="font-poppins font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Jam Operasional
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex justify-between">
                <span>Senin - Kamis</span>
                <span>07:00 - 14:00</span>
              </li>
              <li className="flex justify-between">
                <span>Jumat</span>
                <span>07:00 - 11:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sabtu</span>
                <span>07:00 - 12:00</span>
              </li>
              <li className="flex justify-between">
                <span>Minggu</span>
                <span className="text-red-400">Libur</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
              &copy; {currentYear} SDN Gudang Kopi 1. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs text-center sm:text-right">
              Dibuat dengan ❤️ untuk pendidikan Indonesia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}