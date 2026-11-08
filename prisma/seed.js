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
  console.log(`✅ Super Admin created: ${admin.username} (admin123)`);

  // 3. Customer Demo User
  const customerPasswordHash = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { username: "klien" },
    update: {},
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
  console.log(`✅ Demo Customer created: ${customer.username} (customer123)`);

  // 4. Service Categories & Website Services
  const webCategory = await prisma.serviceCategory.upsert({
    where: { slug: "website-development" },
    update: {},
    create: {
      name: "Website Development",
      slug: "website-development",
      description: "Jasa perancangan dan pembangunan website modern, cepat, aman, dan responsive.",
    },
  });

  const webServices = [
    {
      name: "Landing Page Bisnis",
      slug: "landing-page-bisnis",
      description: "Website satu halaman berkonversi tinggi, dirancang khusus untuk kampanye pemasaran, peluncuran produk, dan personal brand.",
      priceFrom: 500000,
      priceTo: 1200000,
      features: "Desain Editorial Eksklusif\nResponsive Mobile & Desktop\nIntegrasi Tombol WhatsApp & Form\nSEO On-Page Dasar\nFast Loading Speed",
      deliveryDays: 3,
      revisionCount: 3,
      packages: [
        {
          name: "Starter Landing",
          slug: "starter-landing",
          description: "Cocok untuk UMKM dan promo event satu halaman.",
          price: 500000,
          features: JSON.stringify(["Maksimal 4 section", "Desain responsive", "Direct WhatsApp link", "Revisi 2x", "Pengerjaan 3 hari"]),
          deliveryDays: 3,
          revisions: 2,
        },
        {
          name: "Pro Conversion",
          slug: "pro-conversion",
          description: "Landing page lengkap dengan copywriting persuasif dan optimasi conversion rate.",
          price: 950000,
          features: JSON.stringify(["Hingga 8 section", "Animasi smooth", "Direct WA & form leads", "Google Analytics & Meta Pixel", "Revisi 3x", "Pengerjaan 5 hari"]),
          deliveryDays: 5,
          revisions: 3,
          isPopular: true,
        },
      ],
    },
    {
      name: "Company Profile Perusahaan",
      slug: "company-profile-perusahaan",
      description: "Website representasi resmi instansi atau perusahaan untuk meningkatkan kredibilitas, kepercayaan klien, dan citra profesional.",
      priceFrom: 1200000,
      priceTo: 2500000,
      features: "Multi Halaman (Home, About, Services, Projects, Contact)\nCMS Pengelolaan Konten Mudah\nForm Kontak Terhubung Email & WA\nResponsive di Semua Layar\nSetup Keamanan SSL & Anti Spam",
      deliveryDays: 7,
      revisionCount: 4,
      packages: [
        {
          name: "Corporate Standard",
          slug: "corporate-standard",
          description: "Company profile rapi untuk instansi, CV, dan kantor konsultan.",
          price: 1500000,
          features: JSON.stringify(["Hingga 5 halaman", "Desain editorial profesional", "Integrasi Google Maps & WA", "Revisi 3x", "Pengerjaan 7 hari"]),
          deliveryDays: 7,
          revisions: 3,
        },
        {
          name: "Corporate Executive",
          slug: "corporate-executive",
          description: "Solusi lengkap dengan halaman portofolio, artikel, dan integrasi analitik menyeluruh.",
          price: 2400000,
          features: JSON.stringify(["Hingga 10 halaman", "Admin CMS terintegrasi", "Setup email perusahaan", "SEO & Speed Optimization", "Revisi 5x", "Pengerjaan 10 hari"]),
          deliveryDays: 10,
          revisions: 5,
          isPopular: true,
        },
      ],
    },
    {
      name: "Toko Online / E-Commerce UMKM",
      slug: "toko-online-umkm",
      description: "Platform toko online modern dengan katalog produk, keranjang belanja, checkout WhatsApp otomatis, atau integrasi payment.",
      priceFrom: 1800000,
      priceTo: 3000000,
      features: "Katalog Produk Dinamis\nFitur Keranjang Belanja\nCheckout Direct WhatsApp / Payment Gateway\nDashboard Pengelolaan Produk\nPerhitungan Ongkos Kirim Otomatis",
      deliveryDays: 10,
      revisionCount: 5,
      packages: [
        {
          name: "E-Commerce Catalog WA",
          slug: "ecommerce-wa",
          description: "Katalog belanja mudah digunakan dengan pesanan otomatis dikirim ke WhatsApp penjual.",
          price: 1800000,
          features: JSON.stringify(["Katalog unlimited produk", "Keranjang belanja", "Order direct WhatsApp", "Dashboard admin produk", "Revisi 4x", "Pengerjaan 8 hari"]),
          deliveryDays: 8,
          revisions: 4,
        },
        {
          name: "E-Commerce Full Payment",
          slug: "ecommerce-full",
          description: "Toko online otomatis dengan sistem pembayaran QRIS & Transfer Bank serta notifikasi invoice.",
          price: 3000000,
          features: JSON.stringify(["Payment Gateway / QRIS", "Hitung ongkir otomatis", "Sistem akun pelanggan", "Manajemen inventaris", "Revisi 5x", "Pengerjaan 14 hari"]),
          deliveryDays: 14,
          revisions: 5,
          isPopular: true,
        },
      ],
    },
    {
      name: "Website Sekolah & Organisasi",
      slug: "website-sekolah-organisasi",
      description: "Portal informasi resmi sekolah, madrasah, pesantren, yayasan, atau organisasi kemasyarakatan.",
      priceFrom: 1400000,
      priceTo: 2700000,
      features: "Profil Lengkap, Visi Misi & Guru\nBerita & Pengumuman Sekolah\nGaleri Kegiatan & Prestasi\nForm Pendaftaran / PPDB Sederhana\nSertifikat SSL & Proteksi Data",
      deliveryDays: 8,
      revisionCount: 4,
      packages: [
        {
          name: "Edu Standard",
          slug: "edu-standard",
          description: "Cocok untuk yayasan dan sekolah jenjang dasar / menengah.",
          price: 1600000,
          features: JSON.stringify(["Portal informasi sekolah", "Manajemen berita & pengumuman", "Galeri foto kegiatan", "Revisi 4x", "Pengerjaan 8 hari"]),
          deliveryDays: 8,
          revisions: 4,
        },
      ],
    },
  ];

  for (const s of webServices) {
    const service = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        priceFrom: s.priceFrom,
        priceTo: s.priceTo,
        description: s.description,
        features: s.features,
      },
      create: {
        categoryId: webCategory.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        priceFrom: s.priceFrom,
        priceTo: s.priceTo,
        domainHostingNote: "Estimasi biaya domain (.com/.id) & cloud hosting Rp 500.000 – Rp 700.000 per tahun (dikelola terpisah sesuai spesifikasi pilihan).",
        domainHostingMin: 500000,
        domainHostingMax: 700000,
        features: s.features,
        deliveryDays: s.deliveryDays,
        revisionCount: s.revisionCount,
        isActive: true,
      },
    });

    for (const pkg of s.packages) {
      const existingPkg = await prisma.servicePackage.findFirst({
        where: { serviceId: service.id, slug: pkg.slug },
      });
      if (!existingPkg) {
        await prisma.servicePackage.create({
          data: {
            serviceId: service.id,
            name: pkg.name,
            slug: pkg.slug,
            description: pkg.description,
            price: pkg.price,
            features: pkg.features,
            deliveryDays: pkg.deliveryDays,
            revisions: pkg.revisions,
            isPopular: pkg.isPopular || false,
            isActive: true,
          },
        });
      }
    }
  }
  console.log("✅ Web development services & packages seeded.");

  // 5. Graphic Design Categories & Items (15 Categories starting from Rp 50.000)
  const designItems = [
    { catName: "Logo Design", slug: "logo-design", price: 150000, desc: "Desain logo original dengan konsep filosofis, unik, dan siap diaplikasikan di berbagai media.", formats: "AI, EPS, SVG, PNG Transparan, JPG", time: 2, rev: 3 },
    { catName: "Brand Identity", slug: "brand-identity", price: 500000, desc: "Paket identitas visual lengkap mencakup logo guide, palette warna, typography, dan stationary mockup.", formats: "PDF Brand Guideline, AI, PNG, SVG", time: 5, rev: 4 },
    { catName: "Business Card", slug: "business-card", price: 50000, desc: "Desain kartu nama eksklusif dua sisi siap cetak dengan layout tipografi rapi.", formats: "PDF Ready to Print, AI, JPG", time: 1, rev: 2 },
    { catName: "Poster", slug: "poster", price: 85000, desc: "Desain poster promosi event, webinar, atau peluncuran produk dengan visual eye-catching.", formats: "PDF Hi-Res, JPG, PNG", time: 2, rev: 2 },
    { catName: "Flyer / Brosur", slug: "flyer-brosur", price: 75000, desc: "Desain flyer 1 sisi atau 2 sisi untuk penawaran produk dan edukasi layanan bisnis.", formats: "PDF Ready to Print, JPG, PNG", time: 2, rev: 3 },
    { catName: "Banner Digital", slug: "banner-digital", price: 60000, desc: "Banner promosi website, marketplace Tokopedia/Shopee, atau Google Display Ads.", formats: "JPG, PNG, WEBP", time: 1, rev: 2 },
    { catName: "X-Banner & Roll Up", slug: "x-banner", price: 90000, desc: "Desain standing banner ukuran 60x160cm atau 80x200cm resolusi tinggi anti-pecah.", formats: "TIFF, PDF Ready to Print, JPG", time: 2, rev: 2 },
    { catName: "Menu Design", slug: "menu-design", price: 120000, desc: "Buku menu cafe, resto, dan kuliner dengan susunan tata letak menggugah selera.", formats: "PDF Print, JPG, PNG", time: 3, rev: 3 },
    { catName: "Social Media Feed", slug: "social-media-feed", price: 50000, desc: "Konten feed Instagram single atau carousel edukasi dengan branding konsisten.", formats: "JPG, PNG 1080x1080 / 1080x1350", time: 1, rev: 2 },
    { catName: "Instagram Story", slug: "instagram-story", price: 50000, desc: "Desain story interaktif 1080x1920 untuk kuis, promosi flash sale, dan pengumuman.", formats: "JPG, PNG 1080x1920", time: 1, rev: 2 },
    { catName: "Product Catalog", slug: "product-catalog", price: 250000, desc: "Katalog produk multi-halaman dalam format PDF interaktif maupun siap cetak.", formats: "PDF Interactive, AI, JPG", time: 4, rev: 3 },
    { catName: "Packaging Design", slug: "packaging-design", price: 350000, desc: "Desain kemasan box, standing pouch, atau label botol dengan die-cut pola pisau presisi.", formats: "AI Vector, PDF Print Ready, 3D Mockup", time: 4, rev: 4 },
    { catName: "Undangan Digital / Fisik", slug: "invitation-design", price: 80000, desc: "Desain undangan pernikahan, anniversary, atau corporate gathering bergaya modern minimalis.", formats: "PDF, JPG, Video Animasi Singkat", time: 2, rev: 2 },
    { catName: "Custom Graphic Design", slug: "custom-graphic-design", price: 100000, desc: "Kebutuhan desain grafis kustom sesuai brief dan arahan kreatif khusus dari Anda.", formats: "AI, PSD, PDF, PNG, JPG", time: 3, rev: 3 },
  ];

  for (const item of designItems) {
    const cat = await prisma.designCategory.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        name: item.catName,
        slug: item.slug,
        description: `Katalog desain ${item.catName.toLowerCase()} profesional Arvanta Studio.`,
      },
    });

    await prisma.designCatalog.upsert({
      where: { slug: item.slug },
      update: {
        priceStarting: item.price,
        description: item.desc,
      },
      create: {
        categoryId: cat.id,
        name: item.catName,
        slug: item.slug,
        previewImage: `/portfolio/${item.slug}.jpg`,
        description: item.desc,
        priceStarting: item.price,
        deliveryDays: item.time,
        revisions: item.rev,
        fileFormats: item.formats,
        isFeatured: true,
        isActive: true,
      },
    });
  }
  console.log("✅ Graphic design categories & catalog seeded.");

  // 6. Portfolio Items
  const portfolioProjects = [
    {
      title: "Narra Botanicals E-Commerce & Brand",
      slug: "narra-botanicals",
      category: "Website Development",
      clientName: "PT Narra Alam Nusantara",
      description: "Platform e-commerce skincare herbal dengan sistem checkout WhatsApp otomatis dan tampilan editorial minimalis.",
      techStack: "Next.js, Tailwind CSS, Prisma, MySQL",
      featuredImage: "/portfolio/narra.jpg",
      isFeatured: true,
    },
    {
      title: "Svara Coffee Visual Identity",
      slug: "svara-coffee",
      category: "Branding",
      clientName: "Svara Artisan Coffee",
      description: "Perancangan identitas visual menyeluruh mulai dari logo, buku menu, kemasan biji kopi, hingga signage interior.",
      techStack: "Adobe Illustrator, Photoshop",
      featuredImage: "/portfolio/svara.jpg",
      isFeatured: true,
    },
    {
      title: "Artha Logistik Corporate Website",
      slug: "artha-logistik",
      category: "Website Development",
      clientName: "PT Artha Mitra Logistik",
      description: "Company profile modern dengan fitur tracking pengiriman dan formulir penawaran harga instan.",
      techStack: "Next.js, TypeScript, Tailwind",
      featuredImage: "/portfolio/artha.jpg",
      isFeatured: true,
    },
    {
      title: "Karsa Sustainable Furniture Identity",
      slug: "karsa-furniture",
      category: "Graphic Design",
      clientName: "Karsa Living",
      description: "Katalog produk dan kemasan produk furnitur ramah lingkungan dengan gaya tipografi Swiss modern.",
      techStack: "InDesign, Illustrator",
      featuredImage: "/portfolio/karsa.jpg",
      isFeatured: true,
    },
  ];

  for (const p of portfolioProjects) {
    await prisma.portfolio.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log("✅ Portfolio showcase seeded.");

  // 7. Site Settings
  const settings = [
    { key: "site_name", value: "Arvanta Studio" },
    { key: "site_tagline", value: "Digital Experiences, Crafted with Purpose." },
    { key: "hero_headline", value: "Building Digital Experiences That Move Businesses Forward." },
    { key: "hero_subheadline", value: "From websites to visual identities, we help businesses create a stronger and more meaningful digital presence." },
    { key: "admin_whatsapp", value: "62895322465836" },
    { key: "admin_email", value: "contact@arvanta.studio" },
    { key: "address", value: "Purwokerto & Banyumas, Jawa Tengah, Indonesia" },
    { key: "domain_hosting_estimate_text", value: "Rp 500.000 – Rp 700.000 / tahun" },
    { key: "instagram", value: "https://instagram.com/arvantastudio" },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✅ Site settings seeded.");

  // 8. Testimonials
  const testimonials = [
    {
      clientName: "Hendri Wicaksono",
      clientCompany: "Founder, Narra Botanicals",
      clientRole: "CEO",
      rating: 5,
      content: "Website buatan Arvanta Studio benar-benar memiliki karakter editorial yang mewah. Konversi penjualan kami meningkat 140% setelah peluncuran.",
      serviceCategory: "Website Development",
    },
    {
      clientName: "Clarissa Dewi",
      clientCompany: "Owner, Svara Artisan Coffee",
      clientRole: "Creative Director",
      rating: 5,
      content: "Identitas visual dan desain menu dari Arvanta Studio menuai banyak pujian dari pelanggan kami. Tim sangat responsif dan memahami detail estetika.",
      serviceCategory: "Graphic Design",
    },
    {
      clientName: "Bambang Sudiro",
      clientCompany: "PT Artha Mitra Logistik",
      clientRole: "Direktur Operasional",
      rating: 5,
      content: "Proses pengerjaan transparan melalui dashboard order, integrasi WhatsApp admin sangat cepat tanggap. Sangat direkomendasikan untuk institusi.",
      serviceCategory: "Website Development",
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { clientName: t.clientName },
    });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }
  console.log("✅ Testimonials seeded.");

  // 9. FAQs
  const faqs = [
    {
      question: "Berapa lama proses pengerjaan website?",
      answer: "Waktu pengerjaan berkisar antara 3 hingga 14 hari kerja tergantung kompleksitas paket yang Anda pilih. Anda dapat memantau setiap tahapan secara real-time melalui dashboard pelanggan.",
      category: "WEBSITE",
      sortOrder: 1,
    },
    {
      question: "Apakah harga website sudah termasuk domain dan hosting?",
      answer: "Harga jasa pembuatan website terpisah dari domain dan hosting. Kami memberikan estimasi biaya domain (.com/.id) dan cloud hosting berkisar Rp 500.000 – Rp 700.000 per tahun sesuai kebutuhan kapasitas dan spesifikasi Anda.",
      category: "WEBSITE",
      sortOrder: 2,
    },
    {
      question: "Bagaimana alur pemesanan dan pembayaran?",
      answer: "Anda cukup memilih layanan, mengisi formulir kebutuhan serta referensi, kemudian sistem membuat nomor order unik. Anda dapat membayar melalui Transfer Bank atau QRIS dengan opsi DP (Down Payment) atau pelunasan.",
      category: "PAYMENT",
      sortOrder: 3,
    },
    {
      question: "Apakah saya mendapatkan file mentah (master file) untuk desain grafis?",
      answer: "Ya, seluruh pemesanan desain grafis kami sertakan file master resolusi tinggi (AI / EPS / PDF siap cetak) beserta PNG transparan dan JPG.",
      category: "DESIGN",
      sortOrder: 4,
    },
    {
      question: "Apakah ada garansi revisi?",
      answer: "Setiap paket layanan telah mencakup kuota revisi mulai dari 2x hingga 5x untuk memastikan hasil akhir benar-benar memuaskan visi brand Anda.",
      category: "GENERAL",
      sortOrder: 5,
    },
  ];

  for (const f of faqs) {
    const existing = await prisma.faq.findFirst({
      where: { question: f.question },
    });
    if (!existing) {
      await prisma.faq.create({ data: f });
    }
  }
  console.log("✅ FAQs seeded.");

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
