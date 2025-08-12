import { updateApplicationStatus } from '../applicationService';
import prisma from '../../utils/prisma';
import { ApplicationStatus } from '@prisma/client';

jest.mock('../../utils/prisma', () => ({
  application: { findUnique: jest.fn() },
  $transaction: jest.fn(),
}));

describe('updateApplicationStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when application not found', async () => {
    (prisma.application.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await updateApplicationStatus(1, ApplicationStatus.Approved);
    expect(result).toBeNull();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('approves application and creates lease', async () => {
    (prisma.application.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      propertyId: 10,
      tenantCognitoId: 'tenant1',
      property: { pricePerMonth: 1000, securityDeposit: 500 },
      tenant: {},
    });

    const leaseCreate = jest.fn().mockResolvedValue({ id: 5 });
    const propertyUpdate = jest.fn().mockResolvedValue({});
    const applicationUpdate = jest
      .fn()
      .mockResolvedValue({ id: 1, leaseId: 5, status: ApplicationStatus.Approved });

    (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) =>
      fn({
        lease: { create: leaseCreate },
        property: { update: propertyUpdate },
        application: { update: applicationUpdate },
      }),
    );

    const result = await updateApplicationStatus(1, ApplicationStatus.Approved);
    expect(leaseCreate).toHaveBeenCalled();
    expect(propertyUpdate).toHaveBeenCalled();
    expect(applicationUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: ApplicationStatus.Approved, leaseId: 5 },
      include: { property: true, tenant: true, lease: true },
    });
    expect(result).toEqual({ id: 1, leaseId: 5, status: ApplicationStatus.Approved });
  });

  it('updates status without creating lease when not approved', async () => {
    (prisma.application.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      propertyId: 10,
      tenantCognitoId: 'tenant1',
      property: { pricePerMonth: 1000, securityDeposit: 500 },
      tenant: {},
    });

    const leaseCreate = jest.fn();
    const propertyUpdate = jest.fn();
    const applicationUpdate = jest
      .fn()
      .mockResolvedValue({ id: 1, leaseId: null, status: ApplicationStatus.Rejected });

    (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) =>
      fn({
        lease: { create: leaseCreate },
        property: { update: propertyUpdate },
        application: { update: applicationUpdate },
      }),
    );

    const result = await updateApplicationStatus(1, ApplicationStatus.Rejected);
    expect(leaseCreate).not.toHaveBeenCalled();
    expect(propertyUpdate).not.toHaveBeenCalled();
    expect(applicationUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: ApplicationStatus.Rejected },
      include: { property: true, tenant: true, lease: true },
    });
    expect(result).toEqual({ id: 1, leaseId: null, status: ApplicationStatus.Rejected });
  });
});
