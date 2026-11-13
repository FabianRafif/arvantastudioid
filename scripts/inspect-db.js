const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.siteSetting.findMany();
  console.log('--- SITE SETTINGS ---', JSON.stringify(settings, null, 2));
  const banners = await prisma.banner.findMany();
  console.log('--- BANNERS ---', JSON.stringify(banners, null, 2));
  const coupons = await prisma.coupon.findMany();
  console.log('--- COUPONS ---', JSON.stringify(coupons, null, 2));
}

main().finally(() => prisma.$disconnect());
