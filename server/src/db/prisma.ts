import { PrismaClient } from "@prisma/client";

// Ensure a single PrismaClient instance is shared across the app
// Prevent creating new instances on hot reloads in development
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
