import express from 'express';
import request from 'supertest';
import bcrypt from 'bcrypt';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
};

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import { login } from '../controllers/auth-controllers';

const app = express();
app.use(express.json());
app.post('/login', login);

describe('login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs in with correct credentials', async () => {
    const password = 'secret';
    const hashed = await bcrypt.hash(password, 10);
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, password: hashed });

    const res = await request(app).post('/login').send({ userId: 1, password });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged in');
  });

  it('rejects invalid credentials', async () => {
    const hashed = await bcrypt.hash('secret', 10);
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, password: hashed });

    const res = await request(app).post('/login').send({ userId: 1, password: 'wrong' });
    expect(res.status).toBe(401);
  });
});
