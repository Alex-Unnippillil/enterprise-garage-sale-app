import express from 'express';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { io as Client, Socket } from 'socket.io-client';

process.env.DATABASE_URL = 'postgres://test';
process.env.GEOCODE_USER_AGENT = 'test';
process.env.COGNITO_AUDIENCE = 'test';
process.env.COGNITO_ISSUER = 'test';
process.env.AWS_REGION = 'test';
process.env.S3_BUCKET_NAME = 'test';
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';
process.env.CLIENT_ORIGIN = 'http://localhost';
process.env.JWT_SECRET = 'test';

const { initWebSocket } = require('../ws');
const {
  notifyPropertyUpdate,
  notifyNewMessage,
  notifyPaymentStatus,
} = require('../services/notification-service');

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    notification: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn(),
    },
  },
}));

const mockPrisma = require('../utils/prisma').default;

describe('Notification service', () => {
  let ioServer: any;
  let httpServer: any;
  let clientSocket: Socket;

  beforeAll((done) => {
    const app = express();
    httpServer = createServer(app);
    ioServer = initWebSocket(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = Client(`http://localhost:${port}`);
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    ioServer.close();
    clientSocket.close();
    httpServer.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('emits property update to connected user', (done) => {
    clientSocket.emit('register', 'user1');
    clientSocket.once('property:update', (payload) => {
      expect(payload).toEqual({ propertyId: 1 });
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
      done();
    });
    setTimeout(() => {
      notifyPropertyUpdate('user1', { propertyId: 1 });
    }, 50);
  });

  it('stores notification when user offline', async () => {
    await notifyNewMessage('offline', { messageId: 2 });
    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'offline',
        type: 'message:new',
        payload: { messageId: 2 },
        read: false,
      },
    });
  });

  it('emits payment status to connected user', (done) => {
    clientSocket.emit('register', 'user1');
    clientSocket.once('payment:status', (payload) => {
      expect(payload).toEqual({ status: 'Overdue' });
      done();
    });
    setTimeout(() => {
      notifyPaymentStatus('user1', { status: 'Overdue' });
    }, 50);
  });

  it('delivers stored notifications on register', (done) => {
    mockPrisma.notification.findMany.mockResolvedValueOnce([
      {
        id: 1,
        userId: 'user2',
        type: 'payment:status',
        payload: { status: 'Paid' },
        read: false,
      },
    ]);
    clientSocket.emit('register', 'user2');
    clientSocket.once('payment:status', (payload) => {
      expect(payload).toEqual({ status: 'Paid' });
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user2', read: false },
        data: { read: true },
      });
      done();
    });
  });
});
