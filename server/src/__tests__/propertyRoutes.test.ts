import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import propertyRoutes from '../routes/propertyRoutes';
import prisma from '../prismaMock';

jest.mock('@prisma/client', () => {
  const prismaMock = require('../prismaMock').default;
  return { PrismaClient: jest.fn(() => prismaMock) };
});

const app = express();
app.use(express.json());
app.use('/properties', propertyRoutes);

const token = (role: string) =>
  jwt.sign({ sub: 'user1', 'custom:role': role }, 'secret');

describe('Property routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthorized creation', async () => {
    const res = await request(app).post('/properties');
    expect(res.status).toBe(401);
  });

  it('rejects non-manager creation', async () => {
    const res = await request(app)
      .post('/properties')
      .set('Authorization', `Bearer ${token('tenant')}`);
    expect(res.status).toBe(403);
  });
});
