const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const salespeople = await prisma.salesperson.findMany();
  console.log("Salespeople:", salespeople);
}

main().catch(console.error).finally(() => prisma.$disconnect());
