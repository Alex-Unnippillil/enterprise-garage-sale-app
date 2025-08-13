import request from 'supertest';
import express from 'express';

// mocks must be defined before imports that use them
jest.mock('../utils/s3-upload', () => ({
  uploadFilesToS3: jest.fn().mockResolvedValue([]),
}));

jest.mock('../utils/geocode-address', () => ({
  geocodeAddress: jest.fn().mockResolvedValue([0, 0]),
}));

const mockPrisma = {
  property: {
    deleteMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: { join: jest.fn() },
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

const propertyRoutes = require('../routes/property-routes').default;
const {
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/property-controllers');
const prisma = require('../utils/prisma').default;

const app = express();
app.use(express.json());
// custom route to bypass file upload middleware and simulate auth
app.post('/properties', (req, res, next) => {
  (req as any).files = [];
  (req as any).user = { id: 'manager', role: 'manager' };
  createProperty(req, res, next);
});
app.put('/properties/:id', (req, res, next) => {
  (req as any).user = { id: 'manager', role: 'manager' };
  updateProperty(req, res, next);
});
app.delete('/properties/:id', (req, res, next) => {
  (req as any).user = { id: 'manager', role: 'manager' };
  deleteProperty(req, res, next);
});
// other property routes
app.use('/properties', propertyRoutes);

describe('Property API', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await prisma.property.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns 404 for missing property', async () => {
    mockPrisma.property.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/properties/9999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Property not found' });
  });

  it('creates property with valid payload', async () => {
    const propertyCreateMock = jest.fn().mockResolvedValue({
      id: 1,
      name: 'My Property',
      locationId: 1,
      managerCognitoId: 'manager',
      location: {},
      manager: {},
    });

    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        $queryRaw: jest.fn().mockResolvedValue([
          {
            id: 1,
            address: '123',
            city: 'Town',
            state: 'ST',
            country: 'USA',
            postalCode: '00000',
            coordinates: '',
          },
        ]),
        property: { create: propertyCreateMock },
      };
      return cb(tx);
    });

    const payload = {
      address: '123 Main St',
      city: 'Townsville',
      state: 'TS',
      country: 'USA',
      postalCode: '12345',
      name: 'My Property',
      description: 'Nice place',
      pricePerMonth: '1000',
      securityDeposit: '500',
      applicationFee: '50',
      beds: '2',
      baths: '1',
      squareFeet: '900',
      propertyType: 'Apartment',
    };

    const res = await request(app).post('/properties').send(payload);
    expect(res.status).toBe(201);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(propertyCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ managerCognitoId: 'manager' }),
      }),
    );
  });

  it('returns 400 for invalid payload', async () => {
    const invalidPayload = {
      address: '123 Main St',
      city: 'Townsville',
      state: 'TS',
      country: 'USA',
      postalCode: '12345',
      // name missing
      description: 'Nice place',
      pricePerMonth: '1000',
      securityDeposit: '500',
      applicationFee: '50',
      beds: '2',
      baths: '1',
      squareFeet: '900',
      propertyType: 'Apartment',
    };

    const res = await request(app).post('/properties').send(invalidPayload);
    expect(res.status).toBe(400);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it.each(['pricePerMonth', 'securityDeposit', 'applicationFee', 'beds', 'baths', 'squareFeet'])(
    'returns 400 when %s is invalid',
    async (field) => {
      const payload: any = {
        address: '123 Main St',
        city: 'Townsville',
        state: 'TS',
        country: 'USA',
        postalCode: '12345',
        managerCognitoId: 'manager',
        name: 'My Property',
        description: 'Nice place',
        pricePerMonth: '1000',
        securityDeposit: '500',
        applicationFee: '50',
        beds: '2',
        baths: '1',
        squareFeet: '900',
        propertyType: 'Apartment',
      };

      payload[field] = 'invalid';

      const res = await request(app).post('/properties').send(payload);
      expect(res.status).toBe(400);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    },
  );

  it('updates property with valid payload', async () => {
    mockPrisma.property.findUnique.mockResolvedValue({
      id: 1,
      managerCognitoId: 'manager',
    });
    const updateMock = jest.fn().mockResolvedValue({ id: 1, name: 'Updated Property' });
    mockPrisma.property.update.mockImplementation(updateMock);

    const res = await request(app).put('/properties/1').send({ name: 'Updated Property' });
    expect(res.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ name: 'Updated Property' }),
      }),
    );
  });

  it('returns 403 when updating property not owned by user', async () => {
    mockPrisma.property.findUnique.mockResolvedValue({
      id: 1,
      managerCognitoId: 'other',
    });

    const res = await request(app).put('/properties/1').send({ name: 'Updated Property' });
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: 'Forbidden' });
    expect(mockPrisma.property.update).not.toHaveBeenCalled();
  });

  it('returns 404 when updating missing property', async () => {
    mockPrisma.property.findUnique.mockResolvedValue(null);

    const res = await request(app).put('/properties/999').send({ name: 'Updated Property' });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Property not found' });
    expect(mockPrisma.property.update).not.toHaveBeenCalled();
  });

  it('deletes property', async () => {
    mockPrisma.property.findUnique.mockResolvedValue({
      id: 1,
      managerCognitoId: 'manager',
    });
    mockPrisma.property.delete.mockResolvedValue({});

    const res = await request(app).delete('/properties/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Property deleted' });
    expect(mockPrisma.property.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('returns 403 when deleting property not owned by user', async () => {
    mockPrisma.property.findUnique.mockResolvedValue({
      id: 1,
      managerCognitoId: 'other',
    });

    const res = await request(app).delete('/properties/1');
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: 'Forbidden' });
    expect(mockPrisma.property.delete).not.toHaveBeenCalled();
  });

  it('returns 404 when deleting missing property', async () => {
    mockPrisma.property.findUnique.mockResolvedValue(null);

    const res = await request(app).delete('/properties/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Property not found' });
    expect(mockPrisma.property.delete).not.toHaveBeenCalled();
  });
});
