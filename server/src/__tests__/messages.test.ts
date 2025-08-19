import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Client from 'socket.io-client';

const mockPrisma = {
  conversation: {
    findUnique: jest.fn(),
  },
  message: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

jest.mock('../middleware/auth-middleware', () => ({
  authMiddleware: () => (_req: any, _res: any, next: any) => next(),
}));

import messageRoutes from '../routes/message-routes';

const setEnv = () => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.COGNITO_AUDIENCE = 'test-aud';
  process.env.COGNITO_ISSUER = 'test-iss';
};

describe('Messages API', () => {
  let app: express.Express;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    let currentUser = { id: 'tenant1', role: 'tenant' } as any;
    app.use((req, _res, next) => {
      req.user = currentUser;
      next();
    });
    app.use('/messages', messageRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns messages for participant', async () => {
    mockPrisma.conversation.findUnique.mockResolvedValue({
      id: 1,
      tenantCognitoId: 'tenant1',
      managerCognitoId: 'manager1',
    });
    mockPrisma.message.findMany.mockResolvedValue([
      {
        id: 1,
        conversationId: 1,
        senderCognitoId: 'tenant1',
        content: 'hi',
        createdAt: new Date(),
      },
    ]);
    const res = await request(app).get('/messages/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('rejects non-participant', async () => {
    mockPrisma.conversation.findUnique.mockResolvedValue({
      id: 1,
      tenantCognitoId: 'tenant1',
      managerCognitoId: 'manager1',
    });
    const app2 = express();
    app2.use(express.json());
    app2.use((req, _res, next) => {
      req.user = { id: 'other', role: 'tenant' } as any;
      next();
    });
    app2.use('/messages', messageRoutes);
    const res = await request(app2).get('/messages/1');
    expect(res.status).toBe(403);
  });
});

describe('WebSocket messaging', () => {
  let io: Server, server: any, port: number;

  beforeAll((done) => {
    setEnv();
    const app = express();
    server = createServer(app);
    io = new Server(server);
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
          algorithms: ['HS256'],
          audience: process.env.COGNITO_AUDIENCE,
          issuer: process.env.COGNITO_ISSUER,
        }) as any;
        socket.data.user = { id: decoded.sub };
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
    io.on('connection', (socket) => {
      socket.on('joinConversation', async (conversationId: number) => {
        const convo = await mockPrisma.conversation.findUnique({ where: { id: conversationId } });
        const userId = socket.data.user.id;
        if (convo && (convo.tenantCognitoId === userId || convo.managerCognitoId === userId)) {
          socket.join(`conversation_${conversationId}`);
        }
      });
      socket.on('sendMessage', async ({ conversationId, content }) => {
        const convo = await mockPrisma.conversation.findUnique({ where: { id: conversationId } });
        const userId = socket.data.user.id;
        if (convo && (convo.tenantCognitoId === userId || convo.managerCognitoId === userId)) {
          const message = await mockPrisma.message.create({
            data: { conversationId, senderCognitoId: userId, content },
          });
          io.to(`conversation_${conversationId}`).emit('newMessage', message);
        }
      });
    });
    server.listen(() => {
      port = (server.address() as any).port;
      done();
    });
  });

  afterAll(() => {
    io.close();
    server.close();
  });

  it('emits messages to room participants', (done) => {
    mockPrisma.conversation.findUnique.mockResolvedValue({
      id: 1,
      tenantCognitoId: 'tenant1',
      managerCognitoId: 'manager1',
    });
    mockPrisma.message.create.mockResolvedValue({
      id: 1,
      conversationId: 1,
      senderCognitoId: 'tenant1',
      content: 'hello',
      createdAt: new Date(),
    });

    const token = jwt.sign({ sub: 'tenant1', 'custom:role': 'tenant' }, process.env.JWT_SECRET!, {
      algorithm: 'HS256',
      audience: process.env.COGNITO_AUDIENCE,
      issuer: process.env.COGNITO_ISSUER,
    });
    const client = Client(`http://localhost:${port}`, {
      auth: { token },
    });
    client.on('connect', () => {
      client.emit('joinConversation', 1);
      client.emit('sendMessage', { conversationId: 1, content: 'hello' });
    });
    client.on('newMessage', (msg: any) => {
      expect(msg.content).toBe('hello');
      client.close();
      done();
    });
  });
});
