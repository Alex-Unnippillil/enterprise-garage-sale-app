import { Request, Response, NextFunction } from 'express';

// Mock Redis client
const redisGet = jest.fn();
const redisSet = jest.fn();
const redisKeys = jest.fn();
const redisDel = jest.fn();

jest.mock('../utils/redis', () => ({
  __esModule: true,
  default: { get: redisGet, set: redisSet, keys: redisKeys, del: redisDel },
}));

// Mock Prisma client
const mockPrisma = {
  property: { findMany: jest.fn() },
  $queryRaw: jest.fn(),
};

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

process.env.DATABASE_URL = 'postgres://test';
process.env.GEOCODE_USER_AGENT = 'test';
process.env.COGNITO_AUDIENCE = 'test';
process.env.COGNITO_ISSUER = 'test';
process.env.AWS_REGION = 'test';
process.env.S3_BUCKET_NAME = 'test';
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';
process.env.JWT_SECRET = 'test';
process.env.CLIENT_ORIGIN = 'http://localhost:3000';

import { getProperties, clearPropertyCache } from '../controllers/property-controllers';

const createMockRes = () => {
  const res: Partial<Response> = {};
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('property cache', () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retrieves from db and caches results on miss', async () => {
    const req = { query: {} } as Request;
    const res = createMockRes();

    redisGet.mockResolvedValue(null);
    mockPrisma.property.findMany.mockResolvedValue([{ id: 1, locationId: 1, location: {} }]);
    mockPrisma.$queryRaw.mockResolvedValue([{ id: 1, longitude: 0, latitude: 0 }]);

    await getProperties(req, res, next);

    expect(mockPrisma.property.findMany).toHaveBeenCalled();
    expect(redisSet).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([
      {
        id: 1,
        locationId: 1,
        location: { coordinates: { longitude: 0, latitude: 0 } },
      },
    ]);
  });

  it('returns cached results on hit', async () => {
    const req = { query: {} } as Request;
    const res = createMockRes();

    redisGet.mockResolvedValue(JSON.stringify([{ id: 1 }]));

    await getProperties(req, res, next);

    expect(mockPrisma.property.findMany).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('clears property cache keys', async () => {
    redisKeys.mockResolvedValue(['properties:{}']);
    await clearPropertyCache();
    expect(redisDel).toHaveBeenCalledWith(['properties:{}']);
  });
});
