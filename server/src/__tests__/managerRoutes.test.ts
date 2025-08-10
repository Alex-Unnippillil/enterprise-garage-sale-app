import request from 'supertest';
import express from 'express';
import managerRoutes from '../routes/managerRoutes';
import prisma from '../prismaMock';

jest.mock('@prisma/client', () => {
  const prismaMock = require('../prismaMock').default;
  return { PrismaClient: jest.fn(() => prismaMock) };
});

const app = express();
app.use(express.json());
app.use('/managers', managerRoutes);

describe('Manager routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 for unknown manager', async () => {
    prisma.manager.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/managers/abc');
    expect(res.status).toBe(404);
  });

  it('creates a manager', async () => {
    prisma.manager.create.mockResolvedValue({
      id: 1,
      cognitoId: 'abc',
      name: 'Alice',
      email: 'a@example.com',
      phoneNumber: '123',
    });
    const res = await request(app)
      .post('/managers')
      .send({ cognitoId: 'abc', name: 'Alice', email: 'a@example.com', phoneNumber: '123' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Alice');
  });

  it('handles validation errors when creating', async () => {
    prisma.manager.create.mockRejectedValue(new Error('Invalid data'));
    const res = await request(app).post('/managers').send({});
    expect(res.status).toBe(500);
  });
});
