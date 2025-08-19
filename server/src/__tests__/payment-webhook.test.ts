import express from 'express';
import request from 'supertest';

const mockVerifyWebhook = jest.fn();
jest.mock('../services/payment-service', () => ({
  verifyWebhook: mockVerifyWebhook,
}));

const mockPrisma = {
  payment: { update: jest.fn() },
};
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

const paymentRoutes = require('../routes/payment-routes').default;

const app = express();
app.use(express.json());
app.use('/payments', paymentRoutes);

describe('payment webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates payment status on succeeded event', async () => {
    mockVerifyWebhook.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { metadata: { paymentId: '1' } } },
    });

    const res = await request(app)
      .post('/payments/webhook')
      .set('stripe-signature', 'test')
      .send({});

    expect(res.status).toBe(200);
    expect(mockVerifyWebhook).toHaveBeenCalled();
    expect(mockPrisma.payment.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { paymentStatus: 'PAID', paymentDate: expect.any(Date) },
    });
  });
});
