import request from 'supertest';
import express from 'express';

const mockPrisma = {
  payment: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: { join: jest.fn() },
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: 'pi_test', client_secret: 'secret' }),
    },
  }));
});

const prisma = require('../utils/prisma').default;
const { chargePayment, paymentHistory, stripeWebhook } = require('../controllers/payment-controllers');

const app = express();
app.use(express.json());
app.post('/payments/charge', (req, res, next) => {
  (req as any).user = { id: 'tenant1', role: 'tenant' };
  chargePayment(req, res, next);
});
app.get('/payments/history', (req, res, next) => {
  (req as any).user = { id: 'tenant1', role: 'tenant' };
  paymentHistory(req, res, next);
});
app.post('/payments/webhook', stripeWebhook);

describe('Payments API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a charge and returns client secret', async () => {
    const res = await request(app)
      .post('/payments/charge')
      .send({ amount: 1000, leaseId: 1 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ clientSecret: 'secret' });
    expect(mockPrisma.payment.create).toHaveBeenCalled();
  });

  it('returns payment history for tenant', async () => {
    mockPrisma.payment.findMany.mockResolvedValue([{ id: 1 }]);
    const res = await request(app).get('/payments/history');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
    expect(mockPrisma.payment.findMany).toHaveBeenCalledWith({
      where: { lease: { tenantCognitoId: 'tenant1' } },
      orderBy: { paymentDate: 'desc' },
    });
  });

  it('handles webhook events', async () => {
    mockPrisma.payment.update.mockResolvedValue({});
    const res = await request(app).post('/payments/webhook').send({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test', amount_received: 1000 } },
    });
    expect(res.status).toBe(200);
    expect(mockPrisma.payment.update).toHaveBeenCalled();
  });
});
