import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const disconnect = async () => {
  await prisma.$disconnect();
};

process.on("beforeExit", disconnect);
process.on("SIGINT", async () => {
  await disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await disconnect();
  process.exit(0);
});

export default prisma;
