import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import applicationRoutes from '../routes/applicationRoutes';
import prisma from '../prismaMock';

jest.mock('@prisma/client', () => {
  const prismaMock = require('../prismaMock').default;
  return { PrismaClient: jest.fn(() => prismaMock) };
});

const app = express();
app.use(express.json());
app.use('/applications', applicationRoutes);

const token = (role: string) =>
  jwt.sign({ sub: 'user1', 'custom:role': role }, 'secret');

describe('Application routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires authentication to create', async () => {
    const res = await request(app).post('/applications');
    expect(res.status).toBe(401);
  });

  it('prevents managers from creating applications', async () => {
    const res = await request(app)
      .post('/applications')
      .set('Authorization', `Bearer ${token('manager')}`);
    expect(res.status).toBe(403);
  });

  it('returns 404 when property does not exist', async () => {
    prisma.property.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post('/applications')
      .set('Authorization', `Bearer ${token('tenant')}`)
      .send({ propertyId: 1 });
    expect(res.status).toBe(404);
  });

  it('lists applications for a tenant', async () => {
    prisma.application.findMany.mockResolvedValue([]);
    const res = await request(app)
      .get('/applications')
      .set('Authorization', `Bearer ${token('tenant')}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 404 for updating non-existent application', async () => {
    prisma.application.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .put('/applications/1/status')
      .set('Authorization', `Bearer ${token('manager')}`)
      .send({ status: 'Approved' });
    expect(res.status).toBe(404);
  });
});
