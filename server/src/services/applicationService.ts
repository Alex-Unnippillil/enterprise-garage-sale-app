import { PrismaClient, ApplicationStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const updateApplicationStatus = async (
  id: number,
  status: ApplicationStatus
) => {
  // Find application along with property and tenant details
  const application = await prisma.application.findUnique({
    where: { id },
    include: { property: true, tenant: true },
  });

  if (!application) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    if (status === "Approved") {
      const lease = await tx.lease.create({
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
        data: { status, leaseId: lease.id },
        include: { property: true, tenant: true, lease: true },
      });
    }

    // For statuses other than Approved, simply update the status
    return tx.application.update({
      where: { id },
      data: { status },
      include: { property: true, tenant: true, lease: true },
    });
  });
};
