import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import {
  ArrowUpRight,
  Check,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Cpu,
  Layers,
  Clock,
  MessageCircle,
  HelpCircle,
  Code2,
  Palette,
  Wrench,
  ChevronRight,
} from "lucide-react";

export const revalidate = 60; // ISR cache revalidate every 60s

export default async function HomePage() {
  // Query dynamic content from MySQL
  const [services, designItems, portfolios, testimonials, faqs, settingsList] =
    await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        include: { packages: { where: { isActive: true } } },
        take: 6,
      }),
      prisma.designCatalog.findMany({
        where: { isActive: true, isFeatured: true },
        take: 8,
      }),
      prisma.portfolio.findMany({
        where: { isFeatured: true },
        take: 4,
      }),
      prisma.testimonial.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 3,
      }),
      prisma.faq.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 6,
      }),
      prisma.siteSetting.findMany(),
    ]);

  const settings: Record<string, string> = {};
  for (const s of settingsList) {
    settings[s.key] = s.value;
  }

  const headline =
    settings["hero_headline"] ||
    "Building Digital Experiences That Move Businesses Forward.";
  const subheadline =
    settings["hero_subheadline"] ||
    "From websites to visual identities, we help businesses create a stronger and more meaningful digital presence.";
  const adminWhatsApp = settings["admin_whatsapp"] || "62895322465836";

  return (
    <div className="min-h-screen flex flex-col bg-warm-ivory text-deep-charcoal">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* SECTION 1: EDITORIAL HERO SECTION */}
        {/* ========================================================= */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 border-b border-[#D9D7CF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
              {/* Left Column: Typography Statement */}
              <div className="lg:col-span-8 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-deep-charcoal text-warm-ivory text-xs font-mono tracking-wider uppercase rounded-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Digital Agency & Creative Studio</span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight text-deep-charcoal editorial-title leading-[1.03]">
                  {headline}
                </h1>

                <p className="text-base sm:text-lg text-deep-charcoal/80 max-w-2xl editorial-sub font-normal">
                  {subheadline}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link
                    href="/order"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-all duration-200 rounded-xs shadow-xs"
                  >
                    <span>Mulai Proyek Anda</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/portfolio"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-deep-charcoal text-deep-charcoal text-xs font-semibold uppercase tracking-wider hover:bg-deep-charcoal hover:text-warm-ivory transition-all duration-200 rounded-xs"
                  >
                    <span>Lihat Portofolio</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Editorial Metric Grid */}
              <div className="lg:col-span-4 border-l-0 lg:border-l border-[#D9D7CF] lg:pl-8 space-y-6">
                <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-4">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-muted-olive font-bold block">
                    Karakteristik Studio
                  </span>
                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-deep-charcoal text-warm-ivory flex items-center justify-center shrink-0 text-[10px] font-bold">
                        1
                      </div>
                      <div>
                        <strong className="block text-deep-charcoal font-semibold">
                          Custom Design Eksklusif
                        </strong>
                        <span className="text-deep-charcoal/70">
                          Bukan template pasaran atau tiruan AI tanpa jiwa.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-deep-charcoal text-warm-ivory flex items-center justify-center shrink-0 text-[10px] font-bold">
                        2
                      </div>
                      <div>
                        <strong className="block text-deep-charcoal font-semibold">
                          Performa Tinggi & Responsive
                        </strong>
                        <span className="text-deep-charcoal/70">
                          Dibangun dengan Next.js modern, cepat di HP maupun laptop.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-deep-charcoal text-warm-ivory flex items-center justify-center shrink-0 text-[10px] font-bold">
                        3
                      </div>
                      <div>
                        <strong className="block text-deep-charcoal font-semibold">
                          Terintegrasi WhatsApp Admin
                        </strong>
                        <span className="text-deep-charcoal/70">
                          Notifikasi instan setiap ada pesanan dan progres kerja.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-warm-ivory-light border border-[#D9D7CF] rounded-xs">
                    <span className="text-2xl font-bold font-display text-deep-charcoal block">
                      Rp500rb
                    </span>
                    <span className="text-[11px] text-deep-charcoal/70 font-mono">
                      Website Mulai Dari
                    </span>
                  </div>
                  <div className="p-4 bg-warm-ivory-light border border-[#D9D7CF] rounded-xs">
                    <span className="text-2xl font-bold font-display text-deep-charcoal block">
                      Rp50rb
                    </span>
                    <span className="text-[11px] text-deep-charcoal/70 font-mono">
                      Desain Grafis Mulai
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: SERVICES OVERVIEW */}
        {/* ========================================================= */}
        <section className="py-20 lg:py-28 border-b border-[#D9D7CF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <span className="text-xs uppercase tracking-widest font-mono text-muted-olive font-bold block mb-2">
                  Layanan Arvanta Studio
                </span>
                <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-deep-charcoal">
                  Crafted Solutions for Modern Brands.
                </h2>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-deep-charcoal hover:text-muted-olive transition-colors pb-1 border-b border-deep-charcoal"
              >
                <span>Lihat Seluruh Katalog</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Service 1: Website Development */}
              <div className="bg-white border border-[#D9D7CF] p-8 rounded-xs hover:border-deep-charcoal transition-all duration-200 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-warm-ivory flex items-center justify-center rounded-xs text-deep-charcoal group-hover:bg-deep-charcoal group-hover:text-warm-ivory transition-colors">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-deep-charcoal">
                    Website Development
                  </h3>
                  <p className="text-xs text-deep-charcoal/75 leading-relaxed">
                    Pembuatan landing page, company profile, e-commerce, portal sekolah, hingga custom web app. Desain eksklusif dengan performa loading instan dan SEO-ready.
                  </p>
                  <ul className="space-y-2 text-xs text-deep-charcoal/80 pt-2 border-t border-[#D9D7CF]/60">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Rentang Harga Rp500.000 – Rp3.000.000
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Domain & Hosting terpisah (Rp500rb - Rp700rb/th)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Responsive di smartphone, tablet, laptop
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <Link
                    href="/order?service=WEBSITE"
                    className="w-full inline-flex items-center justify-between px-4 py-3 bg-warm-ivory text-deep-charcoal text-xs font-semibold uppercase tracking-wider hover:bg-deep-charcoal hover:text-warm-ivory transition-colors rounded-xs"
                  >
                    <span>Pesan Website</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Service 2: Website Maintenance */}
              <div className="bg-white border border-[#D9D7CF] p-8 rounded-xs hover:border-deep-charcoal transition-all duration-200 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-warm-ivory flex items-center justify-center rounded-xs text-deep-charcoal group-hover:bg-deep-charcoal group-hover:text-warm-ivory transition-colors">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-deep-charcoal">
                    Website Maintenance
                  </h3>
                  <p className="text-xs text-deep-charcoal/75 leading-relaxed">
                    Perawatan menyeluruh agar website Anda selalu online, aman dari malware, update keamanan rutin, backup berkala, dan penambahan konten sesuai kebutuhan.
                  </p>
                  <ul className="space-y-2 text-xs text-deep-charcoal/80 pt-2 border-t border-[#D9D7CF]/60">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Security Patching & SSL Monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Backup Database Berkala
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Update Konten & Optimasi Kecepatan
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <Link
                    href="/contact"
                    className="w-full inline-flex items-center justify-between px-4 py-3 bg-warm-ivory text-deep-charcoal text-xs font-semibold uppercase tracking-wider hover:bg-deep-charcoal hover:text-warm-ivory transition-colors rounded-xs"
                  >
                    <span>Konsultasi Perawatan</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Service 3: Graphic Design */}
              <div className="bg-white border border-[#D9D7CF] p-8 rounded-xs hover:border-deep-charcoal transition-all duration-200 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-warm-ivory flex items-center justify-center rounded-xs text-deep-charcoal group-hover:bg-deep-charcoal group-hover:text-warm-ivory transition-colors">
                    <Palette className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-deep-charcoal">
                    Graphic Design
                  </h3>
                  <p className="text-xs text-deep-charcoal/75 leading-relaxed">
                    15+ kategori desain: Logo, Brand Identity, Kartu Nama, Brosur, Poster, Banner, Feed Instagram, Kemasan, hingga Katalog Produk dengan format siap cetak.
                  </p>
                  <ul className="space-y-2 text-xs text-deep-charcoal/80 pt-2 border-t border-[#D9D7CF]/60">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Harga Terjangkau Mulai Rp50.000
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Master File Vector (AI, EPS, SVG, PDF, PNG)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Pengerjaan Cepat 1 – 3 Hari Kerja
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <Link
                    href="/order?service=GRAPHIC_DESIGN"
                    className="w-full inline-flex items-center justify-between px-4 py-3 bg-warm-ivory text-deep-charcoal text-xs font-semibold uppercase tracking-wider hover:bg-deep-charcoal hover:text-warm-ivory transition-colors rounded-xs"
                  >
                    <span>Pesan Desain Grafis</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: SELECTED PROJECTS SHOWCASE */}
        {/* ========================================================= */}
        <section className="py-20 lg:py-28 bg-[#EAE6DC]/40 border-b border-[#D9D7CF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <span className="text-xs uppercase tracking-widest font-mono text-muted-olive font-bold block mb-2">
                  Selected Work
                </span>
                <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-deep-charcoal">
                  Karya Digital Pilihan Arvanta.
                </h2>
              </div>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-deep-charcoal hover:text-muted-olive transition-colors pb-1 border-b border-deep-charcoal"
              >
                <span>Eksplorasi Seluruh Portofolio</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {portfolios.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#D9D7CF] rounded-xs overflow-hidden group hover:border-deep-charcoal transition-all duration-300"
                >
                  <div className="h-64 sm:h-72 bg-deep-charcoal/5 flex items-center justify-center relative overflow-hidden border-b border-[#D9D7CF]">
                    <div className="w-full h-full p-8 flex flex-col justify-between bg-gradient-to-br from-warm-ivory to-[#D9D7CF]/60">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-muted-olive font-bold">
                        {item.category}
                      </span>
                      <div className="space-y-1">
                        <span className="text-xs text-deep-charcoal/60 font-mono">
                          Client: {item.clientName || "Arvanta Partner"}
                        </span>
                        <h4 className="text-2xl font-display font-bold text-deep-charcoal">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <p className="text-xs text-deep-charcoal/70 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    {item.techStack && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {item.techStack.split(",").map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-warm-ivory text-[10px] font-mono text-deep-charcoal/80 rounded-xs border border-[#D9D7CF]"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: WHY ARVANTA STUDIO */}
        {/* ========================================================= */}
        <section className="py-20 lg:py-28 border-b border-[#D9D7CF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <span className="text-xs uppercase tracking-widest font-mono text-muted-olive font-bold block mb-2">
                Mengapa Memilih Kami
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-deep-charcoal">
                Pendekatan Studio yang Mengutamakan Kualitas & Kejujuran.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Custom Design Berkarakter",
                  desc: "Setiap karya dimulai dari riset audiens dan karakteristik unik brand Anda, bukan template instan generic.",
                  num: "01",
                },
                {
                  title: "Responsive Multi-Device",
                  desc: "Diuji presisi di smartphone Android, iPhone, tablet, hingga layar desktop resolusi tinggi.",
                  num: "02",
                },
                {
                  title: "Teknologi Modern & Cepat",
                  desc: "Dibangun dengan Next.js, TypeScript, dan database MySQL terstruktur yang mudah dipelihara jangka panjang.",
                  num: "03",
                },
                {
                  title: "Identitas Visual Profesional",
                  desc: "Penerapan kaidah tipografi Swiss, proporsi layout seimbang, dan visual hierarchy yang menggerakkan konversi.",
                  num: "04",
                },
                {
                  title: "Kustomisasi Fleksibel",
                  desc: "Paket dan fitur dapat disesuaikan dengan anggaran serta skala pertumbuhan bisnis Anda.",
                  num: "05",
                },
                {
                  title: "Dedicated Support & WhatsApp",
                  desc: "Komunikasi transparan dengan desainer langsung, notifikasi real-time, dan pendampingan pasca-peluncuran.",
                  num: "06",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-8 bg-white border border-[#D9D7CF] rounded-xs space-y-4 hover:border-deep-charcoal transition-colors"
                >
                  <span className="text-sm font-mono text-muted-olive font-bold block">
                    {item.num}
                  </span>
                  <h3 className="text-lg font-display font-bold text-deep-charcoal">
                    {item.title}
                  </h3>
                  <p className="text-xs text-deep-charcoal/70 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: WORKING PROCESS */}
        {/* ========================================================= */}
        <section className="py-20 lg:py-28 bg-deep-charcoal text-warm-ivory border-b border-deep-charcoal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <span className="text-xs uppercase tracking-widest font-mono text-muted-olive font-bold block mb-2">
                Alur Pengerjaan
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-warm-ivory">
                Proses Terstruktur, Transparan, & Tepat Waktu.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { step: "01", title: "Consultation", desc: "Diskusi kebutuhan bisnis, target audiens, dan rekomendasi paket paling efisien." },
                { step: "02", title: "Brief & Planning", desc: "Penyusunan arsitektur informasi, konsep visual, pemilihan warna, dan timeline kerja." },
                { step: "03", title: "Design & Dev", desc: "Eksekusi desain estetis dan pengkodean sistem yang rapi serta aman." },
                { step: "04", title: "Review & Revision", desc: "Uji coba menyeluruh bersama Anda dengan kuota revisi fleksibel hingga puas." },
                { step: "05", title: "Delivery", desc: "Penyerahan file master, serah terima website live, dan panduan penggunaan." },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-warm-ivory/5 border border-warm-ivory/15 rounded-xs space-y-3"
                >
                  <span className="text-xl font-mono font-bold text-muted-olive block">
                    {step.step}
                  </span>
                  <h4 className="text-base font-display font-bold text-warm-ivory">
                    {step.title}
                  </h4>
                  <p className="text-xs text-warm-ivory/70 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 6: TRANSPARENT PRICING PREVIEW */}
        {/* ========================================================= */}
        <section className="py-20 lg:py-28 border-b border-[#D9D7CF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs uppercase tracking-widest font-mono text-muted-olive font-bold block mb-2">
                Biaya Transparan
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-deep-charcoal">
                Paket Jasa Pembuatan Website.
              </h2>
              <div className="mt-4 p-4 bg-amber-50/80 border border-amber-200 text-xs text-amber-900 rounded-xs">
                <strong>Catatan Penting:</strong> Biaya jasa website belum termasuk domain dan cloud hosting (estimasi Rp500.000 – Rp700.000 per tahun sesuai kebutuhan kapasitas domain & server).
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Starter Package */}
              <div className="bg-white border border-[#D9D7CF] p-8 rounded-xs space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-olive font-bold">
                      Starter Landing
                    </span>
                  </div>
                  <div>
                    <span className="text-4xl font-display font-bold text-deep-charcoal">
                      Rp500.000
                    </span>
                    <span className="text-xs text-deep-charcoal/60 block mt-1">
                      Sekali bayar jasa pembuatan
                    </span>
                  </div>
                  <p className="text-xs text-deep-charcoal/70">
                    Satu halaman fokus konversi untuk promo produk atau perkenalan UMKM baru.
                  </p>
                  <ul className="space-y-2.5 text-xs text-deep-charcoal/80 pt-4 border-t border-[#D9D7CF]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      1 Halaman Landing Page (4 Section)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Responsive Smartphone & Desktop
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Tombol Direct WhatsApp
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Pengerjaan 3 Hari Kerja
                    </li>
                  </ul>
                </div>
                <Link
                  href="/order?service=WEBSITE&package=starter"
                  className="w-full py-3 bg-warm-ivory text-deep-charcoal text-center text-xs font-semibold uppercase tracking-wider hover:bg-deep-charcoal hover:text-warm-ivory transition-colors rounded-xs block"
                >
                  Pilih Starter
                </Link>
              </div>

              {/* Corporate Standard */}
              <div className="bg-white border-2 border-deep-charcoal p-8 rounded-xs space-y-6 flex flex-col justify-between relative shadow-sm">
                <div className="absolute -top-3 right-6 bg-deep-charcoal text-warm-ivory px-3 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-xs font-bold">
                  Paling Populer
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-olive font-bold">
                      Corporate Executive
                    </span>
                  </div>
                  <div>
                    <span className="text-4xl font-display font-bold text-deep-charcoal">
                      Rp1.500.000
                    </span>
                    <span className="text-xs text-deep-charcoal/60 block mt-1">
                      Sekali bayar jasa pembuatan
                    </span>
                  </div>
                  <p className="text-xs text-deep-charcoal/70">
                    Company profile representatif multi-halaman untuk perusahaan dan instansi resmi.
                  </p>
                  <ul className="space-y-2.5 text-xs text-deep-charcoal/80 pt-4 border-t border-[#D9D7CF]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Hingga 5 Halaman Konten
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Desain Editorial Premium
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Formulir Kontak Email & WhatsApp
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Integrasi Google Maps & Analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Revisi 3x & Pengerjaan 7 Hari
                    </li>
                  </ul>
                </div>
                <Link
                  href="/order?service=WEBSITE&package=corporate"
                  className="w-full py-3 bg-deep-charcoal text-warm-ivory text-center text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs block"
                >
                  Pilih Corporate
                </Link>
              </div>

              {/* Custom Website */}
              <div className="bg-white border border-[#D9D7CF] p-8 rounded-xs space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-olive font-bold">
                      E-Commerce / Custom Web
                    </span>
                  </div>
                  <div>
                    <span className="text-4xl font-display font-bold text-deep-charcoal">
                      Rp3.000.000
                    </span>
                    <span className="text-xs text-deep-charcoal/60 block mt-1">
                      Maksimal paket kustom
                    </span>
                  </div>
                  <p className="text-xs text-deep-charcoal/70">
                    Sistem toko online penuh, portal sekolah, atau web aplikasi kustom sesuai kebutuhan spesifik.
                  </p>
                  <ul className="space-y-2.5 text-xs text-deep-charcoal/80 pt-4 border-t border-[#D9D7CF]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Katalog Produk & Keranjang Belanja
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Dashboard Pengelolaan Dinamis
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Payment Gateway / Hitung Ongkir
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-olive" />
                      Revisi 5x & Dedicated Support
                    </li>
                  </ul>
                </div>
                <Link
                  href="/order?service=WEBSITE&package=custom"
                  className="w-full py-3 bg-warm-ivory text-deep-charcoal text-center text-xs font-semibold uppercase tracking-wider hover:bg-deep-charcoal hover:text-warm-ivory transition-colors rounded-xs block"
                >
                  Pilih Custom Web
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 7: TESTIMONIALS */}
        {/* ========================================================= */}
        <section className="py-20 lg:py-28 bg-white border-b border-[#D9D7CF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <span className="text-xs uppercase tracking-widest font-mono text-muted-olive font-bold block mb-2">
                Testimonial Klien
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-deep-charcoal">
                Dipercaya oleh Pemilik Bisnis & Komunitas.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-8 bg-warm-ivory border border-[#D9D7CF] rounded-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex text-amber-500 gap-1 text-sm">
                      {"★".repeat(t.rating)}
                    </div>
                    <p className="text-xs text-deep-charcoal/80 italic leading-relaxed">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#D9D7CF]">
                    <strong className="block text-sm text-deep-charcoal font-display font-bold">
                      {t.clientName}
                    </strong>
                    <span className="text-[11px] text-deep-charcoal/60 font-mono block">
                      {t.clientCompany}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 8: FAQ ACCORDION */}
        {/* ========================================================= */}
        <section className="py-20 lg:py-28 border-b border-[#D9D7CF]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-3">
              <span className="text-xs uppercase tracking-widest font-mono text-muted-olive font-bold">
                Pertanyaan Umum
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-deep-charcoal">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group bg-white border border-[#D9D7CF] rounded-xs p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer"
                >
                  <summary className="flex items-center justify-between font-display font-semibold text-deep-charcoal text-sm select-none">
                    <span>{faq.question}</span>
                    <ChevronRight className="w-4 h-4 text-deep-charcoal/50 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-3 text-xs text-deep-charcoal/75 leading-relaxed pt-3 border-t border-[#D9D7CF]/50">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
