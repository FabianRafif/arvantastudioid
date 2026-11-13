import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LivePricingCards from "@/components/LivePricingCards";
import { HelpCircle, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daftar Harga & Paket Website | Arvanta Studio",
  description:
    "Daftar harga pembuatan website profesional, transparan, dan terukur dari Arvanta Studio. Mulai dari Rp1.500.000.",
};

export default async function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EDECE8] text-[#2D2D2D] font-sans selection:bg-[#FF9857] selection:text-[#2D2D2D]">
      <Navbar />

      {/* Crafto Editorial Hero Header */}
      <section className="pt-36 pb-16 md:pt-48 md:pb-24 border-b border-[#D8D8D4] relative overflow-hidden">
        {/* Subtle architectural vertical grid guidelines */}
        <div className="absolute inset-0 pointer-events-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-4 opacity-30">
          <div className="border-r border-[#D8D8D4] h-full" />
          <div className="border-r border-[#D8D8D4] h-full" />
          <div className="border-r border-[#D8D8D4] h-full" />
          <div className="h-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9857] animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold">
              // DAFTAR HARGA &amp; INVESTASI TRANSPARAN
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#2D2D2D] font-bebas leading-[0.92]">
            INVESTASI TERUKUR UNTUK HASIL NYATA.
          </h1>

          <p className="text-sm sm:text-base text-[#787875] max-w-2xl leading-relaxed font-sans">
            Kami percaya kemitraan digital jangka panjang dimulai dari kejujuran biaya. Seluruh cakupan kerja, revisi, dan estimasi waktu pengerjaan disampaikan secara transparan tanpa biaya tersembunyi.
          </p>
        </div>
      </section>

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Real-time Dynamic Pricing Cards */}
          <LivePricingCards />

          {/* Infrastructure Guidance Note */}
          <div className="p-8 sm:p-10 bg-white/80 border border-[#D8D8D4] rounded-2xl space-y-4 max-w-4xl mx-auto shadow-xs">
            <div className="flex items-center gap-2 text-xs font-space font-semibold uppercase tracking-wider text-[#2D2D2D]">
              <HelpCircle className="w-4 h-4 text-[#FF9857]" />
              <span>Pedoman Biaya Infrastruktur Website</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] font-bebas">
              INFORMASI DOMAIN &amp; SERVER HOSTING
            </h3>
            <p className="text-xs sm:text-sm text-[#787875] leading-relaxed font-sans">
              Biaya jasa di Arvanta Studio merupakan biaya pengembangan sistem. Untuk nama domain (.com / .id) dan server cloud hosting, kami membantu konfigurasi penuh ke akun atas nama Anda sendiri sehingga Anda memiliki kepemilikan aset digital 100%.
            </p>
            <div className="p-5 bg-[#EDECE8] border border-[#D8D8D4] rounded-xl text-xs font-space text-[#2D2D2D] space-y-2">
              <div>• Biaya Registrasi Domain (.com / .id): Mulai Rp150.000 – Rp250.000 / tahun</div>
              <div>• Biaya Cloud Hosting SSD Cepat: Mulai Rp350.000 – Rp500.000 / tahun</div>
              <div className="font-bold text-[#2D2D2D] pt-1">
                Seluruh pengaturan DNS, SSL HTTPS gratis, dan integrasi WhatsApp kami bantu konfigurasi tanpa biaya tambahan.
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
