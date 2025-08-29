import request from 'supertest';
import express from 'express';

const mockPrisma = {
  payment: {
    deleteMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $disconnect: jest.fn(),
};

const mockPaymentStatus = {
  Pending: 'Pending',
  Paid: 'Paid',
  PartiallyPaid: 'PartiallyPaid',
  Overdue: 'Overdue',
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: { join: jest.fn() },
  PaymentStatus: mockPaymentStatus,
}));

const { PaymentStatus } = require('@prisma/client');
const prisma = require('../utils/prisma').default;
const { createPayment, updatePayment } = require('../controllers/lease-controllers');

const app = express();
app.use(express.json());

app.post('/leases/:id/payments', (req, res, next) => {
  (req as any).user = { id: 'manager', role: 'manager' };
  createPayment(req, res, next);
});

app.put('/leases/payments/:paymentId', (req, res, next) => {
  (req as any).user = { id: 'manager', role: 'manager' };
  updatePayment(req, res, next);
});

describe('Payment API', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await prisma.payment.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates payment with valid payload', async () => {
    mockPrisma.payment.create.mockResolvedValue({
      id: 1,
      amountDue: 100,
      amountPaid: 50,
      leaseId: 1,
      paymentStatus: PaymentStatus.Pending,
    });

    const res = await request(app)
      .post('/leases/1/payments')
      .send({ amountDue: 100, amountPaid: 50 });

    expect(res.status).toBe(201);
    expect(mockPrisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        leaseId: 1,
        amountDue: 100,
        amountPaid: 50,
        paymentStatus: PaymentStatus.Pending,
      }),
    });
  });

  it('returns 400 when create payload invalid', async () => {
    const res = await request(app).post('/leases/1/payments').send({ amountDue: 'bad' });

    expect(res.status).toBe(400);
    expect(mockPrisma.payment.create).not.toHaveBeenCalled();
  });

  it('updates payment with valid payload', async () => {
    mockPrisma.payment.update.mockResolvedValue({
      id: 1,
      amountDue: 100,
      amountPaid: 75,
      leaseId: 1,
      paymentStatus: PaymentStatus.Paid,
    });

    const res = await request(app)
      .put('/leases/payments/1')
      .send({ amountPaid: 75, paymentStatus: PaymentStatus.Paid });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      amountDue: 100,
      amountPaid: 75,
      leaseId: 1,
      paymentStatus: PaymentStatus.Paid,
    });
    expect(mockPrisma.payment.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { amountPaid: 75, paymentStatus: PaymentStatus.Paid },
    });
  });

  it('returns 400 when update payload invalid', async () => {
    const res = await request(app).put('/leases/payments/1').send({ amountPaid: 'bad' });

    expect(res.status).toBe(400);
    expect(mockPrisma.payment.update).not.toHaveBeenCalled();
  });
});
