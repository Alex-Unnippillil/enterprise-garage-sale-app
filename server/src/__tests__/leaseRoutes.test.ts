import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import leaseRoutes from '../routes/leaseRoutes';
import prisma from '../prismaMock';

jest.mock('@prisma/client', () => {
  const prismaMock = require('../prismaMock').default;
  return { PrismaClient: jest.fn(() => prismaMock) };
});

const app = express();
app.use(express.json());
app.use('/leases', leaseRoutes);

const token = (role: string) =>
  jwt.sign({ sub: 'user1', 'custom:role': role }, 'secret');

describe('Lease routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/leases');
    expect(res.status).toBe(401);
  });

  it('lists leases for tenant', async () => {
    prisma.lease.findMany.mockResolvedValue([]);
    const res = await request(app)
      .get('/leases')
      .set('Authorization', `Bearer ${token('tenant')}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns payments for a lease', async () => {
    prisma.payment.findMany.mockResolvedValue([]);
    const res = await request(app)
      .get('/leases/1/payments')
      .set('Authorization', `Bearer ${token('manager')}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
