import { Request, Response, NextFunction } from 'express';

const mockPrisma = {
  favorite: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  tenant: {
    findUnique: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: { PrismaClientKnownRequestError: class {} },
}));

import prisma from '../utils/prisma';
import { getFavorites, createFavorite, deleteFavorite } from '../controllers/favorite-controllers';

const createMockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('favoriteControllers', () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns favorites for tenant', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.favorite.findMany.mockResolvedValue([{ id: 1 }]);
    const req = { user: { id: 't1' } } as unknown as Request;
    const res = createMockRes();

    await getFavorites(req, res, next);

    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('creates a favorite', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.favorite.create.mockResolvedValue({ id: 1, propertyId: 2, tenantId: 1 });
    const req = { user: { id: 't1' }, body: { propertyId: 2 } } as unknown as Request;
    const res = createMockRes();

    await createFavorite(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockPrisma.favorite.create).toHaveBeenCalled();
  });

  it('deletes a favorite', async () => {
    mockPrisma.favorite.delete.mockResolvedValue({});
    const req = { params: { id: '1' } } as unknown as Request;
    const res = createMockRes();

    await deleteFavorite(req, res, next);

    expect(mockPrisma.favorite.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(res.json).toHaveBeenCalledWith({ message: 'Favorite removed' });
  });
});
