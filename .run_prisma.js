const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.$queryRaw`SELECT count(*) FROM "User"`;
    console.log("DB Push was successful! Users count:", Number(users[0].count));
  } catch(e) {
    console.error("Error querying:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
