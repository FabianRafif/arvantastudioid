const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database seeding for Arvanta Studio...");

  // 1. Roles
  const roles = ["SUPER_ADMIN", "ADMIN", "CUSTOMER"];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `Role for ${roleName.toLowerCase()}`,
      },
    });
  }

  // 2. Super Admin User
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      role: "SUPER_ADMIN",
      isActive: true,
      email: "admin@arvanta.studio",
      fullName: "Super Admin Arvanta",
    },
    create: {
      username: "admin",
      email: "admin@arvanta.studio",
      passwordHash: adminPasswordHash,
      fullName: "Super Admin Arvanta",
      phone: "62895322465836",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log(`✅ Super Admin created: ${admin.username} / admin@arvanta.studio`);

  // 3. Customer Demo User
  const customerPasswordHash = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { username: "klien" },
    update: {
      role: "CUSTOMER",
      isActive: true,
    },
    create: {
      username: "klien",
      email: "klien@gmail.com",
      passwordHash: customerPasswordHash,
      fullName: "Klien Teladan",
      phone: "081234567890",
      role: "CUSTOMER",
      isActive: true,
    },
  });
  console.log(`✅ Demo Customer created: ${customer.username}`);

  // 4. The 14 Service Categories specified in Master Prompt Section 5.C
  const categoriesData = [
    { name: "Website Company Profile", slug: "website-company-profile", desc: "Membangun kredibilitas korporat dan citra profesional perusahaan." },
    { name: "Website Personal dan Organisasi", slug: "website-personal-organisasi", desc: "Portofolio figur publik, yayasan, LSM, dan komunitas." },
    { name: "Website Toko Online", slug: "website-toko-online", desc: "E-Commerce terintegrasi keranjang belanja, checkout, dan multi-kurir." },
    { name: "Website Katalog Produk", slug: "website-katalog-produk", desc: "Showcase produk interaktif langsung terhubung ke WhatsApp sales." },
    { name: "Website Sekolah dan Yayasan", slug: "website-sekolah-yayasan", desc: "Portal informasi akademik, penerimaan siswa baru, dan profil instansi." },
    { name: "Website Travel dan Pariwisata", slug: "website-travel-pariwisata", desc: "Katalog paket wisata, jadwal trip, dan booking perjalanan." },
    { name: "Landing Page", slug: "landing-page", desc: "Halaman kampanye pemasaran terfokus dengan rasio konversi tinggi." },
    { name: "Website Custom", slug: "website-custom", desc: "Arsitektur khusus sesuai kebutuhan fungsional dan model bisnis unik." },
    { name: "Sistem Kasir / POS", slug: "sistem-kasir-pos", desc: "Aplikasi point-of-sale kasir toko, cetak struk, dan laporan penjualan." },
    { name: "Sistem Inventaris dan Stok", slug: "sistem-inventaris-stok", desc: "Manajemen gudang, keluar-masuk barang, dan barcode scanning." },
    { name: "Sistem Administrasi", slug: "sistem-administrasi", desc: "Digitalisasi arsip dokumen, surat-menyurat, dan alur kerja kantor." },
    { name: "Sistem Pemesanan dan Reservasi", slug: "sistem-pemesanan-reservasi", desc: "Booking kamar, jadwal klinik, meja restoran, atau sewa aset." },
    { name: "Dashboard Manajemen Bisnis", slug: "dashboard-manajemen-bisnis", desc: "Visualisasi analitik omzet, performa staf, dan KPI perusahaan." },
    { name: "Sistem Custom sesuai kebutuhan", slug: "sistem-custom", desc: "Pengembangan software web application berskala enterprise." },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const record = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.desc },
      create: { name: cat.name, slug: cat.slug, description: cat.desc },
    });
    categoryMap[cat.slug] = record.id;
  }
  console.log(`✅ ${categoriesData.length} Service Categories upserted.`);

  // 5. Initial Services with base pricing matching Master Prompt
  const servicesData = [
    {
      catSlug: "website-company-profile",
      name: "Website Company Profile Profesional",
      slug: "company-profile-profesional",
      desc: "Website representasi resmi perusahaan dengan desain editorial luxury, tata letak asimetris yang elegan, dan optimasi SEO terdepan untuk meningkatkan kepercayaan klien dan investor.",
      priceFrom: 1500000,
      priceTo: 3500000,
      features: "Desain Editorial Eksklusif\n100% Responsif di Semua Perangkat\nHingga 7 Halaman Struktur Informasi\nCMS Kelola Konten Mandiri\nIntegrasi Formulir Leads & WhatsApp\nOptimasi Kecepatan & SEO Google",
      deliveryDays: 7,
      revisionCount: 3,
      domainHostingNote: "Estimasi Domain (.com/.id) & Cloud Hosting: Rp500.000 – Rp700.000/tahun (dibantu setup penuh).",
    },
    {
      catSlug: "landing-page",
      name: "High-Converting Landing Page",
      slug: "high-converting-landing-page",
      desc: "Halaman kampanye promosi dan peluncuran produk yang dirancang khusus dengan pendekatan psikologi konversi, copywriting tajam, dan CTA langsung ke WhatsApp atau checkout.",
      priceFrom: 1500000,
      priceTo: 2500000,
      features: "Desain Berorientasi Konversi\nFast Loading Speed di Bawah 1.5 Detik\nTracking Pixel & Google Analytics\nDirect WhatsApp Click to Chat\nFormulir Pemesanan Sederhana\nRevisi Desain Cepat",
      deliveryDays: 4,
      revisionCount: 2,
      domainHostingNote: "Dapat menggunakan subdomain yang sudah ada atau setup domain baru.",
    },
    {
      catSlug: "website-toko-online",
      name: "Website Toko Online & E-Commerce",
      slug: "website-toko-online-store",
      desc: "Platform toko daring mandiri dengan katalog produk tanpa batas, keranjang belanja otomatis, perhitungan ongkir ekspedisi, dan laporan transaksi penjualan.",
      priceFrom: 2000000,
      priceTo: 4500000,
      features: "Katalog Produk dengan Variasi (Warna/Ukuran)\nKeranjang Belanja & Checkout Mandiri\nIntegrasi Pembayaran Transfer & QRIS\nKalkulator Ongkir Otomatis\nDashboard Manajemen Pesanan\nNotifikasi WhatsApp Pembelian",
      deliveryDays: 10,
      revisionCount: 3,
      domainHostingNote: "Direkomendasikan Cloud Hosting SSD minimal 2GB RAM untuk transaksi lancar.",
    },
    {
      catSlug: "sistem-pemesanan-reservasi",
      name: "Sistem Pemesanan & Reservasi Digital",
      slug: "sistem-reservasi-booking",
      desc: "Sistem manajemen reservasi terpadu untuk salon, klinik, persewaan mobil, tempat wisata, atau jadwal konsultasi profesional dengan kalender real-time.",
      priceFrom: 2500000,
      priceTo: 5000000,
      features: "Kalender Pemesanan Real-time\nPengecekan Ketersediaan Slot Otomatis\nFormulir Booking dengan Verifikasi Data\nNotifikasi Konfirmasi via Email/WA\nPanel Admin Rekap Jadwal & Pelanggan\nEkspor Rekap Laporan Excel",
      deliveryDays: 12,
      revisionCount: 4,
      domainHostingNote: "Membutuhkan basis data MySQL berkinerja tinggi untuk locking transaksi.",
    },
    {
      catSlug: "sistem-kasir-pos",
      name: "Sistem Kasir & Point of Sale (POS)",
      slug: "sistem-kasir-pos-cloud",
      desc: "Aplikasi kasir berbasis web modern untuk UMKM ritel dan cafe, mendukung cetak struk thermal, pencatatan kas harian, dan manajemen stok bahan baku.",
      priceFrom: 2500000,
      priceTo: 4500000,
      features: "Tampilan Transaksi Cepat & Responsif Tablet\nCetak Struk Thermal via Bluetooth/USB\nPencatatan Modal Awal & Tutup Kasir Harian\nMulti-Kasir dengan Hak Akses Berbeda\nLaporan Laba Kotor & Produk Terlaris\nDukungan Barcode Scanner",
      deliveryDays: 14,
      revisionCount: 3,
      domainHostingNote: "Bisa diakses dari laptop, tablet Android, iPad, dan smartphone kasir.",
    },
  ];

  for (const s of servicesData) {
    const catId = categoryMap[s.catSlug];
    const service = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        description: s.desc,
        priceFrom: s.priceFrom,
        priceTo: s.priceTo,
        features: s.features,
        deliveryDays: s.deliveryDays,
        revisionCount: s.revisionCount,
        domainHostingNote: s.domainHostingNote,
        categoryId: catId,
      },
      create: {
        name: s.name,
        slug: s.slug,
        description: s.desc,
        priceFrom: s.priceFrom,
        priceTo: s.priceTo,
        features: s.features,
        deliveryDays: s.deliveryDays,
        revisionCount: s.revisionCount,
        domainHostingNote: s.domainHostingNote,
        categoryId: catId,
      },
    });

    // 6. Packages for this service matching Section 5.E & 6
    const basePackages = [
      {
        name: "Basic Website",
        slug: `${s.slug}-basic`,
        price: 1500000,
        description: "Solusi esensial untuk kehadiran online profesional pertama Anda.",
        features: JSON.stringify([
          "Website responsif mobile & desktop",
          "Halaman utama + 3 seksi esensial",
          "Informasi bisnis & profil lengkap",
          "Integrasi kontak & WhatsApp",
          "Optimasi SEO dasar Google",
          "Integrasi domain dan hosting",
          "Garansi 30 hari",
        ]),
        deliveryDays: 5,
        revisions: 2,
        isPopular: false,
      },
      {
        name: "Professional Website",
        slug: `${s.slug}-pro`,
        price: 2000000,
        description: "Paket lengkap dengan CMS dan formulir leads terintegrasi.",
        features: JSON.stringify([
          "Seluruh fitur Basic Website",
          "Hingga 7 halaman struktur terintegrasi",
          "CMS kelola konten mandiri",
          "Formulir pelanggan & leads",
          "Integrasi analitik Google & Meta",
          "Optimasi kecepatan tingkat lanjut",
          "Garansi 45 hari",
        ]),
        deliveryDays: 8,
        revisions: 3,
        isPopular: true,
      },
      {
        name: "Premium Website",
        slug: `${s.slug}-premium`,
        price: 3000000,
        description: "Solusi kustom menyeluruh dengan dashboard pengelolaan bisnis.",
        features: JSON.stringify([
          "Seluruh fitur Professional Website",
          "Fitur custom sesuai ruang lingkup bisnis",
          "Dashboard pengelolaan bisnis khusus",
          "Pengembangan lanjutan sesuai kesepakatan",
          "Integrasi sistem pemesanan online",
          "Prioritas dukungan teknis & arsitektur",
          "Garansi 60 hari",
        ]),
        deliveryDays: 14,
        revisions: 5,
        isPopular: false,
      },
    ];

    for (const pkg of basePackages) {
      await prisma.servicePackage.upsert({
        where: { id: `${service.id}-${pkg.slug}` },
        update: {
          name: pkg.name,
          slug: pkg.slug,
          price: pkg.price,
          description: pkg.description,
          features: pkg.features,
          deliveryDays: pkg.deliveryDays,
          revisions: pkg.revisions,
          isPopular: pkg.isPopular,
        },
        create: {
          id: `${service.id}-${pkg.slug}`,
          serviceId: service.id,
          name: pkg.name,
          slug: pkg.slug,
          price: pkg.price,
          description: pkg.description,
          features: pkg.features,
          deliveryDays: pkg.deliveryDays,
          revisions: pkg.revisions,
          isPopular: pkg.isPopular,
        },
      });
    }
  }
  console.log("✅ Core Services and Dynamic Packages seeded.");

  // 7. Seed Official Coupons / Vouchers
  const sampleCoupons = [
    {
      code: "ARVANTA1111",
      discountType: "PERCENTAGE",
      discountValue: 15,
      minSpend: 1500000,
      maxDiscount: 350000,
      usageLimit: 50,
      isActive: true,
    },
    {
      code: "LAUNCH2026",
      discountType: "FIXED",
      discountValue: 200000,
      minSpend: 1500000,
      maxDiscount: 200000,
      usageLimit: 100,
      isActive: true,
    },
    {
      code: "KLIENBARU",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minSpend: 1000000,
      maxDiscount: 200000,
      usageLimit: 200,
      isActive: true,
    },
  ];

  for (const c of sampleCoupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        discountType: c.discountType,
        discountValue: c.discountValue,
        minSpend: c.minSpend,
        maxDiscount: c.maxDiscount,
        usageLimit: c.usageLimit,
        isActive: c.isActive,
      },
      create: c,
    });
  }
  console.log("✅ Active Promotional Coupons seeded.");

  // 8. Site Settings matching Branding requirements
  const settingsData = [
    { key: "SITE_NAME", value: "Arvanta Studio", desc: "Nama resmi brand" },
    { key: "SITE_TAGLINE", value: "Digital Solutions, Built with Purpose.", desc: "Tagline resmi" },
    { key: "STUDIO_PHONE", value: "62895322465836", desc: "Nomor WhatsApp studio" },
    { key: "STUDIO_EMAIL", value: "rafifazmi466@gmail.com", desc: "Email resmi studio" },
    { key: "STUDIO_ADDRESS", value: "Purwokerto, Jawa Tengah, Indonesia", desc: "Alamat operasional" },
    { key: "TIMEZONE", value: "Asia/Jakarta", desc: "Zona waktu server operasional" },
    { key: "CURRENCY", value: "IDR", desc: "Mata uang transaksi" },
    { key: "MAINTENANCE_MODE", value: "false", desc: "Mode pemeliharaan sistem" },
  ];

  for (const s of settingsData) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value, description: s.desc },
    });
  }
  console.log("✅ Site Settings initialized.");

  // 9. Initial FAQs
  const faqsData = [
    {
      question: "Berapa lama proses pengerjaan website di Arvanta Studio?",
      answer: "Paket Basic rata-rata 3-5 hari kerja, Professional 7-10 hari kerja, dan Custom Enterprise System 14-25 hari kerja setelah materi dan DP 50% terverifikasi.",
      category: "PENGERJAAN",
      sortOrder: 1,
    },
    {
      question: "Bagaimana alur pembayaran di Arvanta Studio?",
      answer: "Skema pembayaran terbagi dua tahap: DP 50% di awal untuk memulai pekerjaan, dan Pelunasan 50% setelah website selesai diuji di server staging dan disetujui.",
      category: "PEMBAYARAN",
      sortOrder: 2,
    },
    {
      question: "Apakah saya bisa mengubah konten website sendiri nantinya?",
      answer: "Ya, kami melengkapi website Anda dengan panel CMS yang ramah pengguna sehingga Anda dapat memperbarui tulisan, foto, dan informasi tanpa coding.",
      category: "TEKNIS",
      sortOrder: 3,
    },
    {
      question: "Apakah ada biaya tersembunyi setelah proyek selesai?",
      answer: "Tidak ada. Biaya pengerjaan bersifat sekali bayar (one-time fee). Anda hanya perlu memperpanjang domain dan server hosting setahun sekali.",
      category: "BIAYA",
      sortOrder: 4,
    },
  ];

  for (const f of faqsData) {
    await prisma.faq.create({
      data: {
        question: f.question,
        answer: f.answer,
        category: f.category,
        sortOrder: f.sortOrder,
        isActive: true,
      },
    }).catch(() => {});
  }
  console.log("✅ FAQs seeded.");

  console.log("🎉 Database seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
