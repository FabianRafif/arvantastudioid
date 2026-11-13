const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up expired 11.11 promo from database...");

  // 1. Deactivate 11.11 Flash Sale
  await prisma.siteSetting.upsert({
    where: { key: "flash_sale_active" },
    update: { value: "false" },
    create: { key: "flash_sale_active", value: "false", description: "Status aktif Flash Sale" },
  });

  await prisma.siteSetting.upsert({
    where: { key: "flash_sale_title" },
    update: { value: "PROMO SPESIAL — ARVANTA STUDIO" },
    create: { key: "flash_sale_title", value: "PROMO SPESIAL — ARVANTA STUDIO", description: "Judul bar promosi flash sale" },
  });

  await prisma.siteSetting.upsert({
    where: { key: "flash_sale_voucher_code" },
    update: { value: "ARVANTA20" },
    create: { key: "flash_sale_voucher_code", value: "ARVANTA20", description: "Kode kupon diskon" },
  });

  await prisma.siteSetting.upsert({
    where: { key: "flash_sale_discount_percent" },
    update: { value: "20" },
    create: { key: "flash_sale_discount_percent", value: "20", description: "Persentase diskon promo" },
  });

  await prisma.siteSetting.upsert({
    where: { key: "last_data_version" },
    update: { value: String(Date.now()) },
    create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp versi data untuk sinkronisasi real-time" },
  });

  // 2. Update existing banner if it has 11.11 badge
  const banners = await prisma.banner.findMany();
  for (const b of banners) {
    if (b.badge?.includes("11.11") || b.title?.includes("11.11")) {
      await prisma.banner.update({
        where: { id: b.id },
        data: {
          title: "SOLUSI DIGITAL BISNIS & SISTEM MODERN",
          badge: "PENAWARAN RESMI",
          targetUrl: "/services",
        },
      });
      console.log(`Updated banner ${b.id}`);
    }
  }

  // 3. Ensure coupons have no expired 11.11 active
  const coupons = await prisma.coupon.findMany();
  for (const c of coupons) {
    if (c.code === "ARVANTA1111") {
      await prisma.coupon.update({
        where: { id: c.id },
        data: { isActive: false },
      });
      console.log(`Deactivated coupon ${c.code}`);
    }
  }

  console.log("Cleanup 11.11 completed successfully!");
}

main()
  .catch((err) => {
    console.error("Cleanup error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
