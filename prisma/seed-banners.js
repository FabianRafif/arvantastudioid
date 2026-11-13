const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Banners & Flash Sale Settings...");

  // Seed Flash Sale Site Settings
  const flashSettings = [
    {
      key: "flash_sale_active",
      value: "false",
      description: "Status aktif Flash Sale (true/false)",
    },
    {
      key: "flash_sale_title",
      value: "PROMO SPESIAL — ARVANTA STUDIO",
      description: "Judul bar promosi flash sale",
    },
    {
      key: "flash_sale_discount_percent",
      value: "20",
      description: "Persentase diskon promo",
    },
    {
      key: "flash_sale_voucher_code",
      value: "PROMO20",
      description: "Kode kupon diskon",
    },
    {
      key: "flash_sale_end_time",
      value: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Waktu berakhir hitung mundur Flash Sale",
    },
    {
      key: "flash_sale_subtitle",
      value: "Diskon Pembuatan Website & Desain Grafis Khusus Hari Ini. Gunakan kupon PROMO20 saat order!",
      description: "Keterangan tambahan bar flash sale",
    },
    {
      key: "last_data_version",
      value: String(Date.now()),
      description: "Timestamp sinkronisasi data real-time",
    },
  ];

  for (const s of flashSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }

  // Delete existing demo banners to avoid duplicates
  await prisma.banner.deleteMany({});

  const banners = [
    {
      title: "SOLUSI DIGITAL BISNIS & SISTEM MODERN",
      subtitle: "Layanan pembuatan website profesional dan sistem digital berkelas untuk bisnis Anda",
      badge: "PENAWARAN RESMI",
      imageUrl: "/uploads/banners/banner-web-development.svg",
      targetUrl: "/services",
      isActive: true,
      sortOrder: 1,
    },
    {
      title: "WEBSITE MODERN & CEPAT — MULAI DARI RP1.500.000",
      subtitle: "Solusi digital profesional untuk UMKM, Sekolah, Startup & Perusahaan",
      badge: "PROMO WEBSITE",
      imageUrl: "/uploads/banners/banner-web-development.svg",
      targetUrl: "/services",
      isActive: true,
      sortOrder: 2,
    },
    {
      title: "VISUAL IDENTITY & GRAPHIC DESIGN STUDIO",
      subtitle: "15+ Kategori Desain: Logo, Feed Media Sosial, Kemasan, Brosur, Poster",
      badge: "✨ DESAIN GRAFIS",
      imageUrl: "/uploads/banners/banner-graphic-design.svg",
      targetUrl: "/services#design-catalog",
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const b of banners) {
    await prisma.banner.create({ data: b });
  }

  console.log("Successfully seeded 3 banners & Flash Sale 11.11 settings!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
