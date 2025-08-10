import { PrismaClient, ApplicationStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function updateApplicationStatus(
  id: number,
  status: ApplicationStatus
) {
  return prisma.$transaction(async (tx) => {
    const application = await tx.application.findUnique({
      where: { id },
      include: { property: true, tenant: true },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    if (status === "Approved") {
      const newLease = await tx.lease.create({
        data: {
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          rent: application.property.pricePerMonth,
          deposit: application.property.securityDeposit,
          propertyId: application.propertyId,
          tenantCognitoId: application.tenantCognitoId,
        },
      });

      await tx.property.update({
        where: { id: application.propertyId },
        data: {
          tenants: {
            connect: { cognitoId: application.tenantCognitoId },
          },
        },
      });

      return tx.application.update({
        where: { id },
        data: { status, leaseId: newLease.id },
        include: { property: true, tenant: true, lease: true },
      });
    }

    return tx.application.update({
      where: { id },
      data: { status },
      include: { property: true, tenant: true, lease: true },
    });
  });
}
