import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesExplorer, {
  ServiceItem,
  DesignItem,
} from "@/components/ServicesExplorer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Layanan Website & Desain Grafis | Arvanta Studio",
  description:
    "Katalog lengkap pembuatan website profesional, sistem digital, dan 14+ layanan desain grafis & brand identity dari Arvanta Studio.",
};

const defaultServiceCategories = [
  { id: "sc-1", name: "Company Profile" },
  { id: "sc-2", name: "Toko Online" },
  { id: "sc-3", name: "Sistem Kasir / POS" },
  { id: "sc-4", name: "Dashboard Manajemen" },
];

const defaultServices: ServiceItem[] = [
  {
    id: "ds-1",
    name: "Website Company Profile",
    slug: "website-company-profile",
    description:
      "Website representasi resmi instansi atau perusahaan untuk meningkatkan kredibilitas, kepercayaan klien, dan citra profesional.",
    priceFrom: 1200000,
    deliveryDays: 7,
    revisionCount: 3,
    features:
      "Multi Halaman (Home, About, Services, Kontak)\nCMS Pengelolaan Konten Mudah\nForm Kontak Terhubung Email & WA\nResponsive di Semua Layar\nSetup Keamanan SSL & Anti Spam\nOptimasi SEO Mesin Pencari",
    category: { id: "sc-1", name: "Company Profile" },
    packages: [
      { id: "pkg-1", name: "Basic", price: 1200000 },
      { id: "pkg-2", name: "Professional", price: 2000000, isPopular: true },
      { id: "pkg-3", name: "Enterprise", price: 3500000 },
    ],
  },
  {
    id: "ds-2",
    name: "Toko Online / E-Commerce UMKM",
    slug: "website-toko-online",
    description:
      "Platform toko online modern dengan katalog produk, keranjang belanja, checkout WhatsApp otomatis, atau integrasi payment gateway.",
    priceFrom: 1800000,
    deliveryDays: 10,
    revisionCount: 3,
    features:
      "Katalog Produk Dinamis\nFitur Keranjang Belanja\nCheckout Direct WhatsApp / Payment Gateway\nDashboard Pengelolaan Produk\nPerhitungan Ongkos Kirim Otomatis\nNotifikasi Pesanan Masuk",
    category: { id: "sc-2", name: "Toko Online" },
    packages: [
      { id: "pkg-4", name: "UMKM Starter", price: 1800000 },
      { id: "pkg-5", name: "Pro Commerce", price: 2800000, isPopular: true },
    ],
  },
  {
    id: "ds-3",
    name: "Sistem Kasir & POS Toko",
    slug: "sistem-kasir-pos",
    description:
      "Aplikasi kasir operasional harian untuk toko ritel, cafe, dan UMKM. Pencatatan transaksi real-time, manajemen stok inventaris, dan cetak struk bluetooth.",
    priceFrom: 2200000,
    deliveryDays: 12,
    revisionCount: 4,
    features:
      "Multi Kasir & Multi Cabang\nCetak Struk Thermal Bluetooth/USB\nManajemen Stok & Notifikasi Habis\nRekap Laba Kotor Otomatis\nEkspor Laporan Transaksi Excel\nMode Offline / Online Sinkron",
    category: { id: "sc-3", name: "Sistem Kasir / POS" },
    packages: [
      { id: "pkg-6", name: "Single Store", price: 2200000 },
      { id: "pkg-7", name: "Multi Store Pro", price: 3800000, isPopular: true },
    ],
  },
  {
    id: "ds-4",
    name: "Dashboard Manajemen Bisnis",
    slug: "dashboard-manajemen-bisnis",
    description:
      "Sistem panel administrasi kustom sesuai alur kerja spesifik perusahaan Anda. Autentikasi aman berbasis session, validasi form, dan ekspor laporan berkala.",
    priceFrom: 3000000,
    deliveryDays: 14,
    revisionCount: 4,
    features:
      "Role-Based Access Control (Admin/Staff/Client)\nVisualisasi Grafik & KPI Bisnis\nManajemen Data Relasional MySQL\nAudit Logs Aktivitas Pengguna\nEkspor PDF & Excel Sekali Klik\nIntegrasi REST API Backend",
    category: { id: "sc-4", name: "Dashboard Manajemen" },
    packages: [
      { id: "pkg-8", name: "Standard ERP", price: 3000000 },
      { id: "pkg-9", name: "Custom Tailored", price: 5000000, isPopular: true },
    ],
  },
];

const defaultDesignCategories = [
  { id: "dc-1", name: "Logo Design" },
  { id: "dc-2", name: "Brand Identity" },
  { id: "dc-3", name: "Media Sosial" },
  { id: "dc-4", name: "Promosi & Cetak" },
  { id: "dc-5", name: "Kemasan & Katalog" },
];

const defaultDesignItems: DesignItem[] = [
  {
    id: "dd-1",
    name: "Logo Design",
    slug: "logo-design",
    description:
      "Desain logo original dengan konsep filosofis, unik, dan siap diaplikasikan di berbagai media cetak maupun digital.",
    priceStarting: 150000,
    deliveryDays: 2,
    revisions: 3,
    fileFormats: "AI, EPS, SVG, PNG Transparan, JPG",
    category: { id: "dc-1", name: "Logo Design" },
  },
  {
    id: "dd-2",
    name: "Brand Identity Guideline",
    slug: "brand-identity",
    description:
      "Paket identitas visual lengkap mencakup logo guide, palette warna, typography, dan stationary mockup untuk brand profesional.",
    priceStarting: 500000,
    deliveryDays: 5,
    revisions: 4,
    fileFormats: "PDF Brand Guideline, AI, PNG, SVG",
    category: { id: "dc-2", name: "Brand Identity" },
  },
  {
    id: "dd-3",
    name: "Social Media Feed",
    slug: "social-media-feed",
    description:
      "Template feed Instagram single atau carousel edukasi dengan branding konsisten untuk menaikkan engagement audiens Anda.",
    priceStarting: 50000,
    deliveryDays: 1,
    revisions: 2,
    fileFormats: "JPG, PNG 1080x1080 / 1080x1350",
    category: { id: "dc-3", name: "Media Sosial" },
  },
  {
    id: "dd-4",
    name: "Instagram Story",
    slug: "instagram-story",
    description:
      "Desain story interaktif 1080x1920 untuk kuis, promosi flash sale, dan pengumuman harian bisnis yang memikat mata.",
    priceStarting: 50000,
    deliveryDays: 1,
    revisions: 2,
    fileFormats: "JPG, PNG 1080x1920",
    category: { id: "dc-3", name: "Media Sosial" },
  },
  {
    id: "dd-5",
    name: "Business Card / Kartu Nama",
    slug: "business-card",
    description:
      "Desain kartu nama eksklusif dua sisi siap cetak dengan layout tipografi rapi dan proporsi visual elegan.",
    priceStarting: 50000,
    deliveryDays: 1,
    revisions: 2,
    fileFormats: "PDF Ready to Print, AI, JPG",
    category: { id: "dc-4", name: "Promosi & Cetak" },
  },
  {
    id: "dd-6",
    name: "Poster Promosi",
    slug: "poster",
    description:
      "Desain poster promosi event, webinar, atau peluncuran produk dengan visual eye-catching dan hierarki informasi tegas.",
    priceStarting: 85000,
    deliveryDays: 2,
    revisions: 2,
    fileFormats: "PDF Hi-Res, JPG, PNG",
    category: { id: "dc-4", name: "Promosi & Cetak" },
  },
  {
    id: "dd-7",
    name: "Flyer / Brosur Usaha",
    slug: "flyer-brosur",
    description:
      "Desain flyer 1 sisi atau 2 sisi untuk penawaran produk, diskon toko, dan edukasi layanan bisnis secara persuasif.",
    priceStarting: 75000,
    deliveryDays: 2,
    revisions: 3,
    fileFormats: "PDF Ready to Print, JPG, PNG",
    category: { id: "dc-4", name: "Promosi & Cetak" },
  },
  {
    id: "dd-8",
    name: "Banner Digital & Ads",
    slug: "banner-digital",
    description:
      "Banner promosi website, marketplace Tokopedia/Shopee, atau Google Display Ads dengan CTA tajam dan kontras memikat.",
    priceStarting: 60000,
    deliveryDays: 1,
    revisions: 2,
    fileFormats: "JPG, PNG, WEBP Landscape & Square",
    category: { id: "dc-4", name: "Promosi & Cetak" },
  },
  {
    id: "dd-9",
    name: "X-Banner & Roll Up",
    slug: "xbanner-rollup",
    description:
      "Desain banner berdiri vertikal (60x160cm / 80x200cm) untuk pameran, booth pameran dagang, dan promosi offline toko.",
    priceStarting: 90000,
    deliveryDays: 2,
    revisions: 2,
    fileFormats: "PDF Vector Hi-Res, TIFF, JPG Siap Cetak",
    category: { id: "dc-4", name: "Promosi & Cetak" },
  },
  {
    id: "dd-10",
    name: "Menu Design Resto & Cafe",
    slug: "menu-design",
    description:
      "Desain buku menu makanan dan minuman berkelas dengan visual foto menggugah selera dan layout harga rapi.",
    priceStarting: 120000,
    deliveryDays: 3,
    revisions: 3,
    fileFormats: "PDF Ready to Print, AI, JPG",
    category: { id: "dc-5", name: "Kemasan & Katalog" },
  },
  {
    id: "dd-11",
    name: "Product Catalog",
    slug: "product-catalog",
    description:
      "Katalog produk multi-halaman dalam format PDF interaktif maupun siap cetak untuk distributor dan retail.",
    priceStarting: 250000,
    deliveryDays: 4,
    revisions: 3,
    fileFormats: "PDF Interactive, AI, JPG",
    category: { id: "dc-5", name: "Kemasan & Katalog" },
  },
  {
    id: "dd-12",
    name: "Packaging Design & Label",
    slug: "packaging-design",
    description:
      "Desain kemasan box, standing pouch, atau label botol dengan die-cut pola pisau presisi siap cetak di pabrik.",
    priceStarting: 350000,
    deliveryDays: 4,
    revisions: 4,
    fileFormats: "AI Vector, PDF Print Ready, 3D Mockup",
    category: { id: "dc-5", name: "Kemasan & Katalog" },
  },
  {
    id: "dd-13",
    name: "Undangan Digital / Fisik",
    slug: "invitation-design",
    description:
      "Desain undangan pernikahan, anniversary, atau corporate gathering bergaya modern minimalis yang berkesan hangat.",
    priceStarting: 80000,
    deliveryDays: 2,
    revisions: 2,
    fileFormats: "PDF, JPG, Video Animasi Singkat",
    category: { id: "dc-4", name: "Promosi & Cetak" },
  },
  {
    id: "dd-14",
    name: "Custom Graphic Design",
    slug: "custom-graphic-design",
    description:
      "Kebutuhan desain grafis kustom sesuai brief dan arahan kreatif khusus dari Anda untuk kampanye bisnis apa pun.",
    priceStarting: 100000,
    deliveryDays: 3,
    revisions: 3,
    fileFormats: "AI, PSD, PDF, PNG, JPG",
    category: { id: "dc-1", name: "Logo Design" },
  },
];

export default async function ServicesPage() {
  let categories = defaultServiceCategories;
  let services = defaultServices;
  let designCategories = defaultDesignCategories;
  let designItems = defaultDesignItems;

  try {
    const results = await Promise.all([
      prisma.serviceCategory.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.service.findMany({
        where: { isActive: true },
        include: {
          category: true,
          packages: { where: { isActive: true }, orderBy: { price: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.designCategory.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.designCatalog.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: [{ isFeatured: "desc" }, { priceStarting: "asc" }],
      }),
    ]);

    if (results[0] && results[0].length > 0) categories = results[0];
    if (results[1] && results[1].length > 0) services = results[1] as any;
    if (results[2] && results[2].length > 0) designCategories = results[2];
    if (results[3] && results[3].length > 0) designItems = results[3] as any;
  } catch (err) {
    console.warn("ServicesPage DB query fallback used:", err);
  }

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
              // KATALOG LAYANAN RESMI ARVANTA STUDIO
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#2D2D2D] font-bebas leading-[0.92]">
            CRAFTED WEBSITES &amp; VISUAL IDENTITY.
          </h1>

          <p className="text-sm sm:text-base text-[#787875] max-w-2xl leading-relaxed font-sans">
            Solusi digital komprehensif mulai dari rancang bangun website &amp; sistem digital hingga 14+ aset identitas visual, branding, dan desain grafis profesional untuk bisnis Anda.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-space text-[#2D2D2D]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/80 border border-[#D8D8D4] rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#FF9857]" />
              <span className="font-semibold">{services.length} Layanan Website</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/80 border border-[#D8D8D4] rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#2D2D2D]" />
              <span className="font-semibold">{designItems.length} Layanan Desain Grafis</span>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ServicesExplorer
            initialServices={services}
            initialDesignItems={designItems}
            serviceCategories={categories}
            designCategories={designCategories}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
