import prisma from '../utils/prisma';
import { ApplicationStatus } from '@prisma/client';

export interface AnalyticsResult {
  occupancyRate: number;
  totalRevenue: number;
  applicationFunnel: Record<ApplicationStatus, number>;
}

export const getManagerAnalytics = async (
  managerCognitoId: string,
): Promise<AnalyticsResult> => {
  const totalProperties = await prisma.property.count({
    where: { managerCognitoId },
  });

  const occupied = await prisma.lease.count({
    where: {
      property: { managerCognitoId },
      endDate: { gt: new Date() },
    },
  });

  const revenueAgg = await prisma.payment.aggregate({
    _sum: { amountPaid: true },
    where: { lease: { property: { managerCognitoId } } },
  });

  const applications = await prisma.application.groupBy({
    by: ['status'],
    _count: { _all: true },
    where: { property: { managerCognitoId } },
  });

  const funnel: Record<ApplicationStatus, number> = {
    Pending: 0,
    Approved: 0,
    Denied: 0,
  };
  for (const a of applications) {
    funnel[a.status] = a._count._all;
  }

  const occupancyRate =
    totalProperties === 0 ? 0 : Math.round((occupied / totalProperties) * 100);

  return {
    occupancyRate,
    totalRevenue: revenueAgg._sum.amountPaid ?? 0,
    applicationFunnel: funnel,
  };
};
