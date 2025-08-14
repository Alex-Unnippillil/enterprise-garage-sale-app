import { ApplicationStatus } from '@prisma/client';
import prisma from '../utils/prisma';

/**
 * Update an application's status. When transitioning to Approved a lease is created
 * and the tenant is connected to the property. For any other status change the
 * application is simply updated.
 */
export const updateApplicationStatus = async (
  id: number,
  status: ApplicationStatus,
) => {
  const application = await prisma.application.findUnique({
    where: { id },
    include: { property: true, tenant: true, lease: true },
  });

  if (!application) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    let leaseId = application.leaseId ?? undefined;

    if (
      status === ApplicationStatus.Approved &&
      application.status !== ApplicationStatus.Approved
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
          property: { connect: { id: application.propertyId } },
          tenant: { connect: { cognitoId: application.tenantCognitoId } },
        },
      });

      leaseId = lease.id;

      await tx.property.update({
        where: { id: application.propertyId },
        data: {
          tenants: { connect: { cognitoId: application.tenantCognitoId } },
        },
      });
    }

    return tx.application.update({
      where: { id },
      data: { status, leaseId },
      include: { property: true, tenant: true, lease: true },
    });
  });
};

