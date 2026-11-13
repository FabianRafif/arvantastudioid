const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const banners = await prisma.banner.findMany();
  for (const b of banners) {
    const cleanBadge = (b.badge || "").replace(/[⚡✨★⭐🔥]/g, "").trim();
    const cleanTitle = (b.title || "").replace(/[⚡✨★⭐🔥]/g, "").trim();
    await prisma.banner.update({
      where: { id: b.id },
      data: { badge: cleanBadge, title: cleanTitle },
    });
  }

  const settings = await prisma.siteSetting.findMany();
  for (const s of settings) {
    if (s.value.includes("⚡") || s.value.includes("✨") || s.value.includes("★")) {
      const cleanVal = s.value.replace(/[⚡✨★⭐🔥]/g, "").trim();
      await prisma.siteSetting.update({
        where: { id: s.id },
        data: { value: cleanVal },
      });
    }
  }

  console.log("Database cleaned successfully of all star/sparkle/emoji AI symbols!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
