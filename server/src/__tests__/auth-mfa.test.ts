import express from 'express';
import request from 'supertest';
import { authenticator } from 'otplib';

const mockPrisma = {
  user: {
    update: jest.fn(),
    findUnique: jest.fn(),
  },
};

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import { setupMfa, verifyMfa } from '../controllers/auth-controllers';

const app = express();
app.use(express.json());
app.post('/mfa/setup', setupMfa);
app.post('/mfa/verify', verifyMfa);

describe('MFA controllers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates secret and otpauth url', async () => {
    mockPrisma.user.update.mockResolvedValue({});
    const res = await request(app).post('/mfa/setup').send({ userId: 1 });
    expect(res.status).toBe(200);
    expect(res.body.secret).toBeDefined();
    expect(res.body.otpauth).toBeDefined();
  });

  it('verifies valid token', async () => {
    const secret = authenticator.generateSecret();
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, mfaSecret: secret });
    const token = authenticator.generate(secret);
    const res = await request(app).post('/mfa/verify').send({ userId: 1, token });
    expect(res.status).toBe(200);
  });

  it('rejects invalid token', async () => {
    const secret = authenticator.generateSecret();
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, mfaSecret: secret });
    const res = await request(app).post('/mfa/verify').send({ userId: 1, token: '000000' });
    expect(res.status).toBe(400);
  });
});
