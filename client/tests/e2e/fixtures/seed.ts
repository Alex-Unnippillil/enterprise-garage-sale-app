import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const testManager = {
  cognitoId: 'e2e-test-manager',
  name: 'E2E Test Manager',
  email: 'e2e.manager@example.com',
  phoneNumber: '555-555-5555',
};

export async function seed() {
  await prisma.manager.upsert({
    where: { cognitoId: testManager.cognitoId },
    update: {},
    create: testManager,
  });
}

export async function cleanup() {
  await prisma.manager.deleteMany({
    where: { cognitoId: testManager.cognitoId },
  });
  await prisma.$disconnect();
}
