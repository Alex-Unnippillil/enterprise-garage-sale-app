import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import {
  CLIENT_ORIGIN,
  PORT,
  COGNITO_JWT_PUBLIC_KEY,
  JWT_SECRET,
  COGNITO_AUDIENCE,
  COGNITO_ISSUER,
} from './env';
import { authMiddleware } from './middleware/auth-middleware';
import { notFound } from './middleware/not-found';
import { errorHandler } from './middleware/error-handler';
import prisma from './utils/prisma';

/* ROUTE IMPORT */
import tenantRoutes from './routes/tenant-routes';
import managerRoutes from './routes/manager-routes';
import propertyRoutes from './routes/property-routes';
import leaseRoutes from './routes/lease-routes';
import applicationRoutes from './routes/application-routes';
import messageRoutes from './routes/message-routes';

/* CONFIGURATIONS */
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(cors({ origin: CLIENT_ORIGIN }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

/* ROUTES */
app.get('/', (req, res) => {
  res.send('This is home route');
});

app.use('/applications', applicationRoutes);
app.use('/properties', propertyRoutes);
app.use('/leases', leaseRoutes);
app.use('/tenants', authMiddleware(['tenant']), tenantRoutes);
app.use('/managers', authMiddleware(['manager']), managerRoutes);
app.use('/messages', messageRoutes);

app.use(notFound);
app.use(errorHandler);

/* SERVER */
const port = PORT;
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: { origin: CLIENT_ORIGIN },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Unauthorized'));
  }
  try {
    let decoded: any;
    if (COGNITO_JWT_PUBLIC_KEY) {
      decoded = jwt.verify(token, COGNITO_JWT_PUBLIC_KEY, {
        algorithms: ['RS256'],
        audience: COGNITO_AUDIENCE,
        issuer: COGNITO_ISSUER,
      });
    } else if (JWT_SECRET) {
      decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'],
        audience: COGNITO_AUDIENCE,
        issuer: COGNITO_ISSUER,
      });
    } else {
      throw new Error('Missing JWT configuration');
    }
    socket.data.user = { id: decoded.sub, role: decoded['custom:role'] || '' };
    next();
  } catch (_err) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('joinConversation', async (conversationId: number) => {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    const userId = socket.data.user.id;
    if (
      conversation &&
      (conversation.tenantCognitoId === userId || conversation.managerCognitoId === userId)
    ) {
      socket.join(`conversation_${conversationId}`);
    }
  });

  socket.on(
    'sendMessage',
    async ({ conversationId, content }: { conversationId: number; content: string }) => {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      const userId = socket.data.user.id;
      if (
        conversation &&
        (conversation.tenantCognitoId === userId || conversation.managerCognitoId === userId)
      ) {
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderCognitoId: userId,
            content,
          },
        });
        io.to(`conversation_${conversationId}`).emit('newMessage', message);
      }
    },
  );
});

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
