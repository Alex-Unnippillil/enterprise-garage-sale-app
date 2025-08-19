import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { CLIENT_ORIGIN } from '../env';
import {
  initNotificationService,
  registerClient,
  unregisterClient,
} from '../services/notification-service';

let io: Server;

export const initWebSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: CLIENT_ORIGIN,
    },
  });

  initNotificationService(io);

  io.on('connection', (socket) => {
    socket.on('register', async (userId: string) => {
      await registerClient(userId, socket.id);
    });

    socket.on('disconnect', () => {
      unregisterClient(socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
