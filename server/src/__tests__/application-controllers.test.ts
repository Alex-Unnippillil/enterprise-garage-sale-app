import { Request, Response, NextFunction } from 'express';

// Mock external services
jest.mock('../utils/s3-upload', () => ({ uploadFilesToS3: jest.fn() }));
jest.mock('../utils/geocode-address', () => ({ geocodeAddress: jest.fn() }));

jest.mock('../services/application-service', () => ({
  updateApplicationStatus: jest.fn(),
}));

const mockPrisma = {
  application: { findMany: jest.fn(), create: jest.fn() },
  property: { findUnique: jest.fn() },
  lease: { findFirst: jest.fn(), create: jest.fn() },
  tenant: {},
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: { join: jest.fn() },
}));

import prisma from '../utils/prisma';
import {
  listApplications,
  createApplication,
  updateApplicationStatus,
} from '../controllers/application-controllers';
import { updateApplicationStatus as updateApplicationStatusService } from '../services/application-service';

const createMockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('applicationControllers', () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists applications for tenant', async () => {
    mockPrisma.application.findMany.mockResolvedValue([
      {
        property: { location: { address: 'addr' }, manager: {} },
        tenantCognitoId: 't1',
        propertyId: 1,
      },
    ]);
    mockPrisma.lease.findFirst.mockResolvedValue({
      startDate: new Date('2023-01-01'),
    });

    const req = { query: { userId: 't1', userType: 'tenant' } } as unknown as Request;
    const res = createMockRes();

    await listApplications(req, res, next);

    expect(res.json).toHaveBeenCalled();
    expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantCognitoId: 't1' } }),
    );
  });

  it('creates application when property exists', async () => {
    mockPrisma.property.findUnique.mockResolvedValue({
      pricePerMonth: 1000,
      securityDeposit: 500,
    });

    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        lease: { create: jest.fn().mockResolvedValue({ id: 1 }) },
        application: {
          create: jest.fn().mockResolvedValue({ id: 1, property: {}, tenant: {}, lease: {} }),
        },
      };
      return cb(tx);
    });

    const req = {
      body: {
        applicationDate: new Date().toISOString(),
        status: 'PENDING',
        propertyId: 1,
        tenantCognitoId: 't1',
        name: 'n',
        email: 'e@example.com',
        phoneNumber: 'p',
        message: 'm',
      },
    } as unknown as Request;
    const res = createMockRes();

    await createApplication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it('returns 404 when property missing', async () => {
    mockPrisma.property.findUnique.mockResolvedValue(null);
    const req = {
      body: {
        applicationDate: new Date().toISOString(),
        status: 'PENDING',
        propertyId: 1,
        tenantCognitoId: 't1',
        name: 'n',
        email: 'e@example.com',
        phoneNumber: 'p',
      },
    } as unknown as Request;
    const res = createMockRes();

    await createApplication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Property not found' });
  });

  it('calls next on create error', async () => {
    mockPrisma.property.findUnique.mockRejectedValue(new Error('db'));
    const req = {
      body: {
        applicationDate: new Date().toISOString(),
        status: 'PENDING',
        propertyId: 1,
        tenantCognitoId: 't1',
        name: 'n',
        email: 'e@example.com',
        phoneNumber: 'p',
      },
    } as unknown as Request;
    const res = createMockRes();
    const localNext = jest.fn();

    await createApplication(req, res, localNext);

    expect(localNext).toHaveBeenCalled();
  });

  it('returns 400 for invalid payload', async () => {
    const req = {
      body: {
        // missing required fields
        propertyId: 1,
      },
    } as unknown as Request;
    const res = createMockRes();

    await createApplication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.property.findUnique).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid email', async () => {
    const req = {
      body: {
        applicationDate: new Date().toISOString(),
        status: 'PENDING',
        propertyId: 1,
        tenantCognitoId: 't1',
        name: 'n',
        email: 'not-an-email',
        phoneNumber: 'p',
      },
    } as unknown as Request;
    const res = createMockRes();

    await createApplication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.property.findUnique).not.toHaveBeenCalled();
  });

  it('updates application status', async () => {
    (updateApplicationStatusService as jest.Mock).mockResolvedValue({ id: 1 });
    const req = { params: { id: '1' }, body: { status: 'APPROVED' } } as unknown as Request;
    const res = createMockRes();

    await updateApplicationStatus(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it('returns 404 when updating missing application', async () => {
    (updateApplicationStatusService as jest.Mock).mockResolvedValue(null);
    const req = { params: { id: '1' }, body: { status: 'APPROVED' } } as unknown as Request;
    const res = createMockRes();

    await updateApplicationStatus(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Application not found.' });
  });
});
