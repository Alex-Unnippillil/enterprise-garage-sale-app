import request from 'supertest';
import express from 'express';
import tenantRoutes from '../routes/tenantRoutes';
import prisma from '../prismaMock';

jest.mock('@prisma/client', () => {
  const prismaMock = require('../prismaMock').default;
  return { PrismaClient: jest.fn(() => prismaMock) };
});

const app = express();
app.use(express.json());
app.use('/tenants', tenantRoutes);

describe('Tenant routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 for missing tenant', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/tenants/abc');
    expect(res.status).toBe(404);
  });

  it('creates a tenant', async () => {
    prisma.tenant.create.mockResolvedValue({
      id: 1,
      cognitoId: 'abc',
      name: 'Bob',
      email: 'b@example.com',
      phoneNumber: '123',
    });
    const res = await request(app)
      .post('/tenants')
      .send({ cognitoId: 'abc', name: 'Bob', email: 'b@example.com', phoneNumber: '123' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Bob');
  });

  it('fails to add favorite for unknown tenant', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);
    const res = await request(app).post('/tenants/abc/favorites/1');
    expect(res.status).toBe(404);
  });
});
