const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, username: true, role: true }
  });
  console.log("Users:", users);
}

main().finally(() => prisma.$disconnect());
