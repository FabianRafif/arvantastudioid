import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, ArrowUpRight, HelpCircle } from "lucide-react";

export const revalidate = 60;

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-ivory text-deep-charcoal">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs uppercase tracking-widest font-mono text-muted-olive font-bold">
              Struktur Harga & Biaya
            </span>
            <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-deep-charcoal editorial-title">
              Transparan, Jujur, & Tanpa Biaya Tersembunyi.
            </h1>
            <p className="text-sm sm:text-base text-deep-charcoal/80 leading-relaxed font-normal">
              Kami percaya kemitraan digital jangka panjang dimulai dari kejujuran biaya. Seluruh cakupan kerja, revisi, dan estimasi biaya pihak ketiga disampaikan sejak awal.
            </p>
          </div>

          {/* Domain & Hosting Highlight Box */}
          <div className="p-8 bg-white border border-[#D9D7CF] rounded-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted-olive uppercase">
              <HelpCircle className="w-4 h-4" />
              <span>Pedoman Biaya Infrastruktur Website</span>
            </div>
            <h3 className="text-xl font-display font-bold text-deep-charcoal">
              Mengapa Biaya Website Terpisah dari Domain & Hosting?
            </h3>
            <p className="text-xs text-deep-charcoal/80 leading-relaxed">
              Biaya jasa pembuatan website di Arvanta Studio adalah <strong>biaya sekali bayar</strong> untuk desain visual eksklusif, pengembangan kode, dan penataan konten. Sementara domain (alamat .com/.id) dan cloud hosting adalah <strong>layanan berlangganan tahunan</strong> milik Anda secara independen.
            </p>
            <div className="p-4 bg-warm-ivory border border-[#D9D7CF] rounded-xs text-xs font-mono text-deep-charcoal space-y-1">
              <div>• Estimasi Domain (.com / .id): Rp150.000 – Rp250.000 / tahun</div>
              <div>• Estimasi Cloud Hosting Cepat: Rp350.000 – Rp500.000 / tahun</div>
              <div className="font-bold text-muted-olive pt-1">
                Total Estimasi Domain & Server: Rp500.000 – Rp700.000 per tahun
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#D9D7CF] p-8 rounded-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-olive font-bold">
                  Starter Website
                </span>
                <div className="text-3xl font-display font-bold text-deep-charcoal">
                  Rp500.000
                </div>
                <p className="text-xs text-deep-charcoal/70">
                  Landing page satu halaman terarah untuk peluncuran produk atau promo UMKM.
                </p>
                <ul className="space-y-2.5 text-xs text-deep-charcoal/80 pt-4 border-t border-[#D9D7CF]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-muted-olive" />
                    Maksimal 4 section konten
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-muted-olive" />
                    Responsive mobile & desktop
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-muted-olive" />
                    Direct tombol WhatsApp
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-muted-olive" />
                    Pengerjaan 3 hari • Revisi 2x
                  </li>
                </ul>
              </div>
              <Link
                href="/order?service=WEBSITE&package=starter"
                className="w-full py-3 bg-warm-ivory text-deep-charcoal text-center text-xs font-semibold uppercase tracking-wider hover:bg-deep-charcoal hover:text-warm-ivory transition-colors rounded-xs block"
              >
                Pilih Paket Ini
              </Link>
            </div>

            <div className="bg-white border-2 border-deep-charcoal p-8 rounded-xs space-y-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-olive font-bold">
                  Corporate Standard
                </span>
                <div className="text-3xl font-display font-bold text-deep-charcoal">
                  Rp1.500.000
                </div>
                <p className="text-xs text-deep-charcoal/70">
                  Website multi-halaman lengkap untuk meningkatkan profil dan kepercayaan perusahaan.
                </p>
                <ul className="space-y-2.5 text-xs text-deep-charcoal/80 pt-4 border-t border-[#D9D7CF]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-muted-olive" />
                    Hingga 5 halaman konten
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-muted-olive" />
                    Desain editorial kustom
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-muted-olive" />
                    Formulir lead WhatsApp & email
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-muted-olive" />
                    Pengerjaan 7 hari • Revisi 3x
                  </li>
                </ul>
              </div>
              <Link
                href="/order?service=WEBSITE&package=corporate"
                className="w-full py-3 bg-deep-charcoal text-warm-ivory text-center text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs block"
              >
                Pilih Paket Ini
              </Link>
            </div>

            <div className="bg-white border border-[#D9D7CF] p-8 rounded-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-olive font-bold">
                  Graphic Design Katalog
                </span>
                <div className="text-3xl font-display font-bold text-deep-charcoal">
                  Mulai Rp50.000
                </div>
                <p className="text-xs text-deep-charcoal/70">
                  15+ format materi promosi dan visual identity dengan vector master file.
                </p>
                <ul className="space-y-2.5 text-xs text-deep-charcoal/80 pt-4 border-t border-[#D9D7CF]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-muted-olive" />
                    Logo, Brosur, Poster, Banner, Feed
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-muted-olive" />
                    Master file vector siap cetak
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-muted-olive" />
                    Revisi 2x – 4x
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-muted-olive" />
                    Pengerjaan 1 – 3 hari kerja
                  </li>
                </ul>
              </div>
              <Link
                href="/services#graphic-design"
                className="w-full py-3 bg-warm-ivory text-deep-charcoal text-center text-xs font-semibold uppercase tracking-wider hover:bg-deep-charcoal hover:text-warm-ivory transition-colors rounded-xs block"
              >
                Pilih Desain Grafis
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
