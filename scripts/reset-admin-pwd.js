const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 12);
  await prisma.user.update({
    where: { username: "admin" },
    data: { passwordHash: hash, isActive: true, role: "SUPER_ADMIN" },
  });
  console.log("Admin password reset to admin123 successfully!");
}

main().finally(() => prisma.$disconnect());
