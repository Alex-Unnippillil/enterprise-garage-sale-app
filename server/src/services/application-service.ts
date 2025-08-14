import { ApplicationStatus } from '@prisma/client';
import prisma from '../utils/prisma';

export const updateApplicationStatus = async (id: number, status: ApplicationStatus) => {
  // Find application along with property and tenant details
  const application = await prisma.application.findUnique({
    where: { id },
    include: { property: true, tenant: true },
  });

  if (!application) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    if (
      application.status !== ApplicationStatus.Approved &&
      status === ApplicationStatus.Approved
    ) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const lease = await tx.lease.create({
        data: {
          startDate,
          endDate,
          rent: application.property.pricePerMonth,
          deposit: application.property.securityDeposit,
          propertyId: application.propertyId,
          tenantCognitoId: application.tenantCognitoId,
        },
      });

      await tx.property.update({
        where: { id: application.propertyId },
        data: {
          tenants: { connect: { cognitoId: application.tenantCognitoId } },
        },
      });

      return tx.application.update({
        where: { id },
        data: { status, leaseId: lease.id },
        include: { property: true, tenant: true, lease: true },
      });
    }

    return tx.application.update({
      where: { id },
      data: { status },
      include: { property: true, tenant: true, lease: true },
    });
  });
};
