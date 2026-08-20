import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Hero from "@/components/sections/Hero";
import Berita from "@/components/sections/Berita";
import VisiMisi from "@/components/sections/VisiMisi";
import GuruSection from "@/components/sections/GuruSection";
import KepsekSection from "@/components/sections/KepsekSection";
import Kontak from "@/components/sections/Kontak";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <KepsekSection />
      <Berita />
      <VisiMisi />
      <GuruSection />
      <Kontak />
      <Footer />
    </main>
  );
}
