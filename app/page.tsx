import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BannerCarousel from "@/components/BannerCarousel";
import HeroQuickPricing from "@/components/HeroQuickPricing";
import LivePricingCards from "@/components/LivePricingCards";
import { prisma } from "@/lib/prisma";
import {
  ArrowUpRight,
  Check,
  MessageCircle,
  ChevronRight,
  Star,
  Sparkles,
  Smartphone,
  Code2,
  Palette,
  Layers,
  Globe,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 60; // ISR cache revalidate every 60s

export default async function HomePage() {
  // Query dynamic content from MySQL with error resilience
  let services: any[] = [];
  let designItems: any[] = [];
  let portfolios: any[] = [];
  let testimonials: any[] = [];
  let faqs: any[] = [];
  let banners: any[] = [];
  let settingsList: any[] = [];

  try {
    const results = await Promise.all([
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
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.siteSetting.findMany(),
    ]);

    services = results[0];
    designItems = results[1];
    portfolios = results[2];
    testimonials = results[3];
    faqs = results[4];
    banners = results[5];
    settingsList = results[6];
  } catch (error) {
    console.error("Database query fallback engaged in HomePage:", error);
    banners = [
      {
        id: "fb-1",
        title: "SOLUSI DIGITAL BISNIS & SISTEM MODERN",
        subtitle: "Layanan pembuatan website profesional dan sistem digital berkelas untuk bisnis Anda",
        badge: "PENAWARAN RESMI",
        imageUrl: "/uploads/banners/banner-web-development.svg",
        targetUrl: "/services",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: "fb-2",
        title: "WEBSITE MODERN & CEPAT — MULAI DARI RP1.500.000",
        subtitle: "Solusi digital profesional untuk UMKM, Sekolah, Startup & Perusahaan",
        badge: "PROMO WEBSITE",
        imageUrl: "/uploads/banners/banner-web-development.svg",
        targetUrl: "/services",
        isActive: true,
        sortOrder: 2,
      },
      {
        id: "fb-3",
        title: "VISUAL IDENTITY & GRAPHIC DESIGN STUDIO",
        subtitle: "15+ Kategori Desain: Logo, Feed Media Sosial, Kemasan, Brosur, Poster",
        badge: "DESAIN GRAFIS",
        imageUrl: "/uploads/banners/banner-graphic-design.svg",
        targetUrl: "/services?tab=design#design-catalog",
        isActive: true,
        sortOrder: 3,
      },
    ];
  }

  const settings: Record<string, string> = {};
  for (const s of settingsList) {
    settings[s.key] = s.value;
  }

  const headline =
    settings["hero_headline"] ||
    "Solusi Digital Bisnis & Sistem Modern";
  const subheadline =
    settings["hero_subheadline"] ||
    "Arvanta Studio membangun platform web berkinerja tinggi, sistem digital terintegrasi, dan identitas visual berkelas untuk mendorong pertumbuhan bisnis Anda.";
  const adminWhatsApp = settings["admin_whatsapp"] || "62895322465836";

  // Fallback testimonials if empty
  const displayTestimonials =
    testimonials.length > 0
      ? testimonials
      : [
          {
            id: "t-1",
            clientName: "Budi Santoso",
            clientCompany: "Direktur PT Sinar Nusantara",
            content:
              "Arvanta Studio mewujudkan website korporat kami dengan kecepatan dan estetika yang luar biasa. Sangat profesional dan tepat waktu.",
            rating: 5,
          },
          {
            id: "t-2",
            clientName: "Rina Kusuma",
            clientCompany: "Founder Glow Beauty ID",
            content:
              "Sistem kasir dan e-commerce toko kami terintegrasi lancar. Desainnya mewah dan meningkatkan kepercayaan pembeli sejak hari pertama.",
            rating: 5,
          },
          {
            id: "t-3",
            clientName: "Hendra Wijaya",
            clientCompany: "Owner Wijaya Logistics",
            content:
              "Dashboard administrasi kustom yang dibuat sangat mempermudah pelacakan armada kami. Dukungan teknis via WhatsApp sangat sigap.",
            rating: 5,
          },
        ];

  // Fallback FAQs if empty
  const displayFaqs =
    faqs.length > 0
      ? faqs
      : [
          {
            id: "f-1",
            question: "Berapa lama estimasi pengerjaan website di Arvanta Studio?",
            answer:
              "Estimasi waktu pengerjaan bervariasi sesuai paket: Landing Page & Website Basic membutuhkan waktu 3–5 hari kerja, Professional Website 5–7 hari kerja, dan sistem kustom atau e-commerce 7–14 hari kerja.",
          },
          {
            id: "f-2",
            question: "Apakah saya mendapatkan akses admin dan kepemilikan penuh?",
            answer:
              "Ya, 100%. Anda mendapatkan akses penuh ke panel admin, database, serta seluruh berkas kode sumber website tanpa ikatan lisensi tersembunyi.",
          },
          {
            id: "f-3",
            question: "Bagaimana sistem pembayaran dan termin proyek?",
            answer:
              "Pembayaran dilakukan secara aman melalui transfer bank dengan sistem termin DP (Uang Muka) sebesar 50% di awal proyek dan pelunasan 50% setelah website selesai diuji dan siap tayang.",
          },
          {
            id: "f-4",
            question: "Apakah website sudah responsif di HP dan ramah SEO?",
            answer:
              "Seluruh website yang dibangun oleh Arvanta Studio dioptimasi secara menyeluruh untuk smartphone, tablet, laptop, serta menerapkan praktik SEO teknis terbaik agar mudah ditemukan di Google.",
          },
        ];

  return (
    <div className="min-h-screen flex flex-col bg-[#EDECE8] text-[#2D2D2D] font-sans selection:bg-[#FF9857] selection:text-[#2D2D2D]">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* SECTION 1: CRAFTO DESIGN AGENCY LUXURY HERO */}
        {/* Giant Bebas Neue Display Headline + Floating Feather Sculptures */}
        {/* ========================================================= */}
        <section className="relative pt-36 pb-20 md:pt-48 md:pb-28 overflow-hidden border-b border-[#D8D8D4]">
          {/* Subtle architectural vertical grid guidelines */}
          <div className="absolute inset-0 pointer-events-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-4 sm:grid-cols-4 opacity-30">
            <div className="border-r border-[#D8D8D4] h-full" />
            <div className="border-r border-[#D8D8D4] h-full" />
            <div className="border-r border-[#D8D8D4] h-full" />
            <div className="h-full" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Top Eyebrow Tag */}
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9857] animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold">
                // CREATIVE DIGITAL &amp; SOFTWARE STUDIO
              </span>
            </div>

            {/* Giant Multi-Line Display Headline with Striped & Tangerine Highlights */}
            <div className="relative mb-10">
              {/* Floating Sculptural Ribbon 1 (Top-Right) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/crafto/feather-01.svg"
                alt="Sculptural Ribbon Ornament"
                className="absolute -top-16 -right-6 sm:top-[-40px] sm:right-10 md:right-32 w-32 sm:w-48 md:w-64 lg:w-72 pointer-events-none z-20 opacity-90 drop-shadow-[0_20px_35px_rgba(255,152,87,0.3)] animate-pulse"
                style={{ animationDuration: "6s" }}
              />

              {/* Floating Sculptural Ribbon 2 (Mid-Left) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/crafto/feather-02.svg"
                alt="Floating Ribbon Wing"
                className="absolute top-28 -left-8 sm:top-24 sm:left-4 md:left-24 w-28 sm:w-40 md:w-52 pointer-events-none z-20 opacity-80 drop-shadow-[0_15px_30px_rgba(255,152,87,0.25)] hidden sm:block"
              />

              <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[142px] font-bold font-bebas text-[#2D2D2D] leading-[0.88] tracking-tight uppercase select-none">
                <span className="striped-text block">BRANDING</span>
                <span className="block">&amp; DIGITAL SYSTEM</span>
                <span className="text-[#FF9857] block">STUDIO</span>
              </h1>
            </div>

            {/* Sub-hero 2-Column Split: Editorial Paragraph & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6 border-t border-[#D8D8D4]">
              {/* Left Column: Editorial Manifesto & Quick Pricing Widget */}
              <div className="lg:col-span-7 space-y-6">
                <p className="text-base sm:text-lg text-[#787875] leading-relaxed font-sans max-w-2xl">
                  {subheadline}
                </p>

                {/* Integrated Dynamic Quick Pricing (Reaktif ke MySQL & Flash Sale) */}
                <div className="pt-2 max-w-lg">
                  <span className="text-[10px] uppercase font-space tracking-widest text-[#787875] block mb-2 font-semibold">
                    // PENAWARAN HARGA AWAL TERKINI
                  </span>
                  <HeroQuickPricing />
                </div>
              </div>

              {/* Right Column: CTA Action Buttons */}
              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-end justify-end gap-3.5 pt-2">
                <Link
                  href="/order"
                  className="px-8 py-4 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 text-center cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>Mulai Order Sekarang</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/${adminWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-7 py-4 border border-[#2D2D2D] hover:bg-[#2D2D2D] text-[#2D2D2D] hover:text-white text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all text-center cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#FF9857]" />
                  <span>Konsultasi WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Studio Banner Carousel (160 x 60 cm) Prominent Placement */}
        <BannerCarousel initialBanners={banners} />

        {/* ========================================================= */}
        {/* SECTION 2: ARCHITECTURAL CAPABILITIES & SERVICES (01) */}
        {/* Numbered rows with 1px border dividers in Crafto aesthetic */}
        {/* ========================================================= */}
        <section className="py-20 lg:py-28 border-b border-[#D8D8D4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16">
              <div>
                <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold block mb-2">
                  // 01 · LAYANAN KAMI
                </span>
                <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#2D2D2D] font-bebas">
                  KEMAMPUAN &amp; SPESIALISASI DIGITAL
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#787875] max-w-md font-sans">
                Setiap solusi dirancang khusus dengan pendekatan rekayasa modern, performa tinggi, dan orientasi konversi bisnis nyata.
              </p>
            </div>

            {/* 4 Architectural Rows */}
            <div className="divide-y divide-[#D8D8D4] border-y border-[#D8D8D4]">
              {/* Row 1: Web Development */}
              <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center group hover:bg-white/40 transition-colors px-4 -mx-4 rounded-xl">
                <div className="md:col-span-1">
                  <span className="text-xs font-space font-bold text-[#787875] group-hover:text-[#FF9857] transition-colors">
                    01/
                  </span>
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] font-bebas tracking-wide">
                    WEBSITE DEVELOPMENT
                  </h3>
                  <span className="text-xs text-[#787875] font-space uppercase">
                    Company Profile • Toko Online • Web Portal
                  </span>
                </div>
                <div className="md:col-span-5">
                  <p className="text-xs sm:text-sm text-[#787875] leading-relaxed font-sans">
                    Pembuatan website profil usaha, katalog produk, dan toko online dengan framework Next.js 16. Responsif di seluruh layar ponsel, terintegrasi WhatsApp, dan teroptimasi SEO teknis.
                  </p>
                </div>
                <div className="md:col-span-2 flex justify-start md:justify-end">
                  <Link
                    href="/order?service=WEBSITE"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#D8D8D4] group-hover:border-[#2D2D2D] group-hover:bg-[#2D2D2D] group-hover:text-white text-[#2D2D2D] text-xs font-space font-semibold uppercase tracking-wider transition-all"
                  >
                    <span>Pesan Website ↗</span>
                  </Link>
                </div>
              </div>

              {/* Row 2: POS & Cashier System */}
              <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center group hover:bg-white/40 transition-colors px-4 -mx-4 rounded-xl">
                <div className="md:col-span-1">
                  <span className="text-xs font-space font-bold text-[#787875] group-hover:text-[#FF9857] transition-colors">
                    02/
                  </span>
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] font-bebas tracking-wide">
                    SISTEM KASIR &amp; POS TOKO
                  </h3>
                  <span className="text-xs text-[#787875] font-space uppercase">
                    Multi-Kasir • Thermal Print • Stok Otomatis
                  </span>
                </div>
                <div className="md:col-span-5">
                  <p className="text-xs sm:text-sm text-[#787875] leading-relaxed font-sans">
                    Aplikasi kasir operasional harian untuk toko ritel, cafe, dan UMKM. Pencatatan transaksi real-time, manajemen stok inventaris, cetak struk bluetooth, dan rekap laba kotor otomatis.
                  </p>
                </div>
                <div className="md:col-span-2 flex justify-start md:justify-end">
                  <Link
                    href="/order?service=POS"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#D8D8D4] group-hover:border-[#2D2D2D] group-hover:bg-[#2D2D2D] group-hover:text-white text-[#2D2D2D] text-xs font-space font-semibold uppercase tracking-wider transition-all"
                  >
                    <span>Pesan Sistem ↗</span>
                  </Link>
                </div>
              </div>

              {/* Row 3: Graphic Design & Branding */}
              <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center group hover:bg-white/40 transition-colors px-4 -mx-4 rounded-xl">
                <div className="md:col-span-1">
                  <span className="text-xs font-space font-bold text-[#787875] group-hover:text-[#FF9857] transition-colors">
                    03/
                  </span>
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] font-bebas tracking-wide">
                    DESAIN GRAFIS &amp; BRAND IDENTITY
                  </h3>
                  <span className="text-xs text-[#787875] font-space uppercase">
                    Logo Vector • Kemasan • Feed Media Sosial
                  </span>
                </div>
                <div className="md:col-span-5">
                  <p className="text-xs sm:text-sm text-[#787875] leading-relaxed font-sans">
                    15+ kategori aset grafis profesional siap pakai. Desain logo orisinal, panduan palet warna brand, kemasan produk, brosur, banner cetak, hingga konten media sosial siap tayang.
                  </p>
                </div>
                <div className="md:col-span-2 flex justify-start md:justify-end">
                  <Link
                    href="/services?tab=design#design-catalog"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#D8D8D4] group-hover:border-[#2D2D2D] group-hover:bg-[#2D2D2D] group-hover:text-white text-[#2D2D2D] text-xs font-space font-semibold uppercase tracking-wider transition-all"
                  >
                    <span>Katalog Desain ↗</span>
                  </Link>
                </div>
              </div>

              {/* Row 4: Custom Enterprise Dashboard */}
              <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center group hover:bg-white/40 transition-colors px-4 -mx-4 rounded-xl">
                <div className="md:col-span-1">
                  <span className="text-xs font-space font-bold text-[#787875] group-hover:text-[#FF9857] transition-colors">
                    04/
                  </span>
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] font-bebas tracking-wide">
                    DASHBOARD MANAJEMEN BISNIS
                  </h3>
                  <span className="text-xs text-[#787875] font-space uppercase">
                    MySQL Database • Admin CMS • Role Kustom
                  </span>
                </div>
                <div className="md:col-span-5">
                  <p className="text-xs sm:text-sm text-[#787875] leading-relaxed font-sans">
                    Sistem panel administrasi kustom sesuai alur kerja spesifik perusahaan Anda. Autentikasi aman berbasis session, validasi form terenkripsi, dan ekspor laporan berkala.
                  </p>
                </div>
                <div className="md:col-span-2 flex justify-start md:justify-end">
                  <Link
                    href="/order"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#D8D8D4] group-hover:border-[#2D2D2D] group-hover:bg-[#2D2D2D] group-hover:text-white text-[#2D2D2D] text-xs font-space font-semibold uppercase tracking-wider transition-all"
                  >
                    <span>Konsultasi Kustom ↗</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: CRAFTO WHY CHOOSE US (02) */}
        {/* Split Manifesto + 3 Numbered Principles */}
        {/* ========================================================= */}
        <section className="py-20 lg:py-28 border-b border-[#D8D8D4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left Column: Big Philosophy & Action Hook */}
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold block">
                  // 02 · MENGAPA MEMILIH KAMI
                </span>
                <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#2D2D2D] font-bebas leading-[0.95]">
                  DIBANGUN DENGAN TUJUAN. DIRANCANG UNTUK HASIL.
                </h2>
                <p className="text-sm sm:text-base text-[#787875] leading-relaxed font-sans">
                  Kami tidak sekadar membuat halaman web yang terlihat menarik. Kami membangun ekosistem digital yang kokoh, cepat, dan transparan untuk memudahkan operasional bisnis Anda serta melipatgandakan kepercayaan calon konsumen.
                </p>

                {/* Hook Box */}
                <div className="p-6 rounded-2xl bg-white border border-[#D8D8D4] space-y-3">
                  <span className="text-xs font-space uppercase tracking-wider text-[#FF9857] font-bold block">
                    ★ KOMITMEN MUTU ARVANTA
                  </span>
                  <p className="text-xs text-[#2D2D2D] leading-relaxed">
                    Setiap baris kode ditulis dengan standar produksi ketat, tanpa template usang, dengan hak kepemilikan penuh diserahkan kepada Anda.
                  </p>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 text-xs font-space uppercase tracking-wider font-semibold text-[#2D2D2D] hover:text-[#FF9857] transition-colors pt-1"
                  >
                    <span>Pelajari Nilai Studio Kami ↗</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: 3 Numbered Principle Cards */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-8 rounded-2xl bg-white/70 hover:bg-white border border-[#D8D8D4] hover:border-[#2D2D2D] transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-space font-bold text-[#FF9857] uppercase tracking-wider">
                      // PRINSIP 01
                    </span>
                    <span className="text-xs font-space text-[#787875]">Standar Rekayasa</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] font-bebas">
                    KUALITAS KODE &amp; DESAIN TANPA KOMPROMI
                  </h3>
                  <p className="text-xs sm:text-sm text-[#787875] leading-relaxed font-sans">
                    Bukan template tiruan murah. Arsitektur Next.js 16 modern menjamin kecepatan loading instan di bawah 1 detik, skor Google PageSpeed optimal, dan keamanan data tingkat tinggi.
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-white/70 hover:bg-white border border-[#D8D8D4] hover:border-[#2D2D2D] transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-space font-bold text-[#FF9857] uppercase tracking-wider">
                      // PRINSIP 02
                    </span>
                    <span className="text-xs font-space text-[#787875]">Integritas Data</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] font-bebas">
                    DATABASE MYSQL &amp; REAL-TIME LIVE SYNC
                  </h3>
                  <p className="text-xs sm:text-sm text-[#787875] leading-relaxed font-sans">
                    Semua penawaran, harga promo flash sale, dan banner terhubung langsung ke database MySQL operasional. Perubahan di panel admin langsung terefleksi secara otomatis.
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-white/70 hover:bg-white border border-[#D8D8D4] hover:border-[#2D2D2D] transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-space font-bold text-[#FF9857] uppercase tracking-wider">
                      // PRINSIP 03
                    </span>
                    <span className="text-xs font-space text-[#787875]">Transparansi Penuh</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] font-bebas">
                    HAK MILIK PENUH 100% &amp; TANPA BIAYA TERSEMBUNYI
                  </h3>
                  <p className="text-xs sm:text-sm text-[#787875] leading-relaxed font-sans">
                    Seluruh file master, akses panel admin, dan aset sistem diserahkan seutuhnya kepada Anda. Bebas biaya langganan sewa platform tersembunyi yang memberatkan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: CRAFTO "FACTS & FIGURES" (DARK COUNTER SECTION) */}
        {/* Pitch Charcoal #131312 + Huge 110px Bebas Neue Numbers */}
        {/* ========================================================= */}
        <section className="bg-[#131312] text-white py-24 sm:py-32 relative overflow-hidden border-y border-[#333331]">
          {/* Subtle Architectural Grid Lines */}
          <div className="absolute inset-0 pointer-events-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-4 opacity-15">
            <div className="border-r border-[#333331] h-full" />
            <div className="border-r border-[#333331] h-full" />
            <div className="border-r border-[#333331] h-full" />
            <div className="h-full" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Top Header Row */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
              <div className="max-w-2xl space-y-4">
                <span className="text-xs uppercase tracking-widest font-space text-[#FF9857] font-semibold block">
                  // FACTS &amp; FIGURES
                </span>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-bebas leading-[0.95]">
                  ANGKA YANG MEMBUKTIKAN DEDIKASI KAMI
                </h2>
              </div>
              <p className="text-sm sm:text-base text-neutral-400 max-w-md font-sans leading-relaxed">
                Kami menggabungkan presisi rekayasa perangkat lunak dan keanggunan estetika editorial untuk menghadirkan platform digital yang teruji performanya.
              </p>
            </div>

            {/* 4 Massive Stat Columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 pt-12 border-t border-[#333331]">
              <div className="space-y-2">
                <span className="text-7xl sm:text-9xl lg:text-[110px] font-bold font-bebas text-white block leading-none">
                  150+
                </span>
                <span className="text-xs font-space uppercase tracking-wider text-[#FF9857] font-semibold block">
                  Proyek Sukses Dikerjakan
                </span>
                <p className="text-xs text-neutral-400 font-sans pt-1">
                  Website korporat, toko online, hingga sistem POS UMKM &amp; retail.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-7xl sm:text-9xl lg:text-[110px] font-bold font-bebas text-white block leading-none">
                  5+
                </span>
                <span className="text-xs font-space uppercase tracking-wider text-[#FF9857] font-semibold block">
                  Tahun Pengalaman Rekayasa
                </span>
                <p className="text-xs text-neutral-400 font-sans pt-1">
                  Spesialisasi penuh pada modern web stack, database, dan UI/UX berkelas.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-7xl sm:text-9xl lg:text-[110px] font-bold font-bebas text-[#FF9857] block leading-none">
                  99.8%
                </span>
                <span className="text-xs font-space uppercase tracking-wider text-white font-semibold block">
                  Kepuasan &amp; Rekomendasi Klien
                </span>
                <p className="text-xs text-neutral-400 font-sans pt-1">
                  Ulasan bintang lima terverifikasi dari mitra bisnis seluruh Indonesia.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-7xl sm:text-9xl lg:text-[110px] font-bold font-bebas text-white block leading-none">
                  24/7
                </span>
                <span className="text-xs font-space uppercase tracking-wider text-[#FF9857] font-semibold block">
                  Dukungan Teknis Siaga
                </span>
                <p className="text-xs text-neutral-400 font-sans pt-1">
                  Komunikasi langsung via WhatsApp dengan tim teknis Arvanta.
                </p>
              </div>
            </div>

            {/* Bottom Dark CTA Row */}
            <div className="mt-16 pt-10 border-t border-[#333331] flex flex-col sm:flex-row items-center justify-between gap-6">
              <span className="text-xs font-space uppercase tracking-wider text-neutral-400">
                PUNYA KEBUTUHAN SISTEM KHUSUS? KAMI SIAP MENYELESAIKANNYA.
              </span>
              <Link
                href="/order"
                className="px-8 py-3.5 bg-[#FF9857] hover:bg-white text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Konsultasi Sekarang ↗</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 6: TRANSPARENT PRICING CARDS (03) */}
        {/* Dynamic & Real-time Live Sync (Flash Sale & Database Reactivity) */}
        {/* ========================================================= */}
        <section className="py-20 lg:py-28 border-b border-[#D8D8D4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12 space-y-3">
              <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold block">
                // 03 · DAFTAR HARGA TRANSPARAN
              </span>
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#2D2D2D] font-bebas">
                PAKET JASA PEMBUATAN WEBSITE RESMI
              </h2>
              <div className="p-4 bg-white border border-[#D8D8D4] text-xs text-[#787875] rounded-xl font-sans">
                <strong className="text-[#2D2D2D]">Catatan Transparan:</strong> Biaya jasa pembuatan website belum termasuk domain &amp; cloud hosting (estimasi biaya server berkisar Rp500.000 – Rp700.000 per tahun sesuai kebutuhan kapasitas domain &amp; traffic server Anda).
              </div>
            </div>

            {/* Dynamic Live Pricing Cards */}
            <LivePricingCards isHomepage={true} />
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 7: TESTIMONIALS & CLUTCH RATING (04) */}
        {/* 4.95 Rating Box + Client Reviews */}
        {/* ========================================================= */}
        <section className="py-20 lg:py-28 border-b border-[#D8D8D4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-16">
              <div className="lg:col-span-8">
                <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold block mb-2">
                  // 04 · REPUTASI &amp; ULASAN KLIEN
                </span>
                <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#2D2D2D] font-bebas">
                  DIPERCAYAI OLEH PEMILIK BISNIS &amp; MITRA
                </h2>
              </div>

              {/* Clutch-style Rating Pill Badge */}
              <div className="lg:col-span-4 flex lg:justify-end">
                <div className="p-5 rounded-2xl bg-white border border-[#D8D8D4] flex items-center gap-4 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-[#2D2D2D] text-[#FF9857] flex items-center justify-center font-bold text-xl font-bebas">
                    4.95
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[#FF9857]">
                      <Star className="w-3.5 h-3.5 fill-[#FF9857]" />
                      <Star className="w-3.5 h-3.5 fill-[#FF9857]" />
                      <Star className="w-3.5 h-3.5 fill-[#FF9857]" />
                      <Star className="w-3.5 h-3.5 fill-[#FF9857]" />
                      <Star className="w-3.5 h-3.5 fill-[#FF9857]" />
                    </div>
                    <span className="text-[10px] font-space font-semibold uppercase tracking-wider text-[#2D2D2D] block">
                      Kepuasan Klien Terverifikasi
                    </span>
                    <span className="text-[10px] text-[#787875] block font-sans">
                      Berdasarkan 150+ proyek selesai
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-8 bg-white/70 hover:bg-white border border-[#D8D8D4] hover:border-[#2D2D2D] rounded-2xl space-y-5 flex flex-col justify-between transition-all duration-300 shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#FF9857]">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#FF9857]" />
                        ))}
                      </div>
                      <span className="text-[10px] font-space font-semibold uppercase tracking-wider text-[#787875]">
                        ✓ Terverifikasi
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#2D2D2D] italic leading-relaxed font-sans">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#D8D8D4]">
                    <strong className="block text-sm text-[#2D2D2D] font-bold font-sans">
                      {t.clientName}
                    </strong>
                    <span className="text-[11px] text-[#787875] font-space uppercase tracking-wider block">
                      {t.clientCompany}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 8: FAQ ACCORDION (05) */}
        {/* ========================================================= */}
        <section className="py-20 lg:py-28 border-b border-[#D8D8D4]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-3">
              <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold block">
                // 05 · PUSAT BANTUAN &amp; FAQ
              </span>
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#2D2D2D] font-bebas">
                PERTANYAAN YANG SERING DIAJUKAN
              </h2>
              <p className="text-xs sm:text-sm text-[#787875] font-sans">
                Informasi penting seputar proses kerja sama, kepemilikan sistem, dan dukungan teknis.
              </p>
            </div>

            <div className="space-y-3">
              {displayFaqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group bg-white/70 hover:bg-white border border-[#D8D8D4] hover:border-[#2D2D2D] rounded-xl p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-xs transition-colors"
                >
                  <summary className="flex items-center justify-between font-semibold text-[#2D2D2D] text-sm sm:text-base select-none font-sans">
                    <span>{faq.question}</span>
                    <span className="w-8 h-8 rounded-full bg-[#EDECE8] group-open:bg-[#2D2D2D] text-[#2D2D2D] group-open:text-white flex items-center justify-center shrink-0 group-open:rotate-90 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm text-[#787875] leading-relaxed pt-3 border-t border-[#D8D8D4] font-sans">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 9: GIANT STRIPED WATERMARK (TRANSITION INTO FOOTER) */}
        {/* ========================================================= */}
        <section className="pt-16 pb-0 overflow-hidden relative select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-5xl sm:text-8xl md:text-9xl lg:text-[150px] font-bold font-bebas text-[#2D2D2D]/20 leading-none tracking-tight block uppercase striped-text-light whitespace-nowrap">
              ARVANTA STUDIO
            </span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
