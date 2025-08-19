import { createApplication } from '../controllers/application-controllers';
import { createPayment } from '../controllers/lease-controllers';
import { sendMessage } from '../controllers/message-controllers';
import prisma from '../utils/prisma';
import { dispatchNotification } from '../services/notification-service';

jest.mock('../services/notification-service', () => ({
  dispatchNotification: jest.fn(),
}));

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    property: { findUnique: jest.fn() },
    application: { create: jest.fn() },
    payment: { create: jest.fn(), update: jest.fn() },
  },
}));

const res = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('controller event dispatch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('emits notification on application creation', async () => {
    (prisma.property.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      managerCognitoId: 'manager1',
    });
    (prisma.application.create as jest.Mock).mockResolvedValue({ id: 1 });
    const req: any = {
      body: {
        applicationDate: '2024-01-01',
        status: 'Pending',
        propertyId: 1,
        tenantCognitoId: 'tenant1',
        name: 'T',
        email: 't@t.com',
        phoneNumber: '123',
      },
      params: {},
    };
    await createApplication(req, res(), jest.fn());
    expect(dispatchNotification).toHaveBeenCalledWith('manager1', 'New application submitted');
  });

  it('emits notification on payment creation', async () => {
    (prisma.payment.create as jest.Mock).mockResolvedValue({ id: 1 });
    const req: any = {
      params: { id: '1' },
      body: { amountDue: 100, amountPaid: 50 },
      user: { id: 'manager1' },
    };
    await createPayment(req, res(), jest.fn());
    expect(dispatchNotification).toHaveBeenCalledWith('manager1', 'Payment created');
  });

  it('emits notification on message send', async () => {
    const req: any = { body: { recipientId: 'user1', message: 'Hello' } };
    await sendMessage(req, res(), jest.fn());
    expect(dispatchNotification).toHaveBeenCalledWith('user1', 'Hello');
  });
});
