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
    if (status === 'Approved') {
      const lease = await tx.lease.create({
        data: {
          property: { connect: { id: application.propertyId } },
          tenant: { connect: { cognitoId: application.tenantCognitoId } },
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

    // For statuses other than transitioning to Approved, simply update the status
    return tx.application.update({
      where: { id },
      data: { status },
      include: { property: true, tenant: true, lease: true },
    });
  });
};
