import type { Server } from 'socket.io';
import prisma from '../utils/prisma';

let io: Server;
const userSockets = new Map<string, string>();

export const initNotificationService = (ioInstance: Server) => {
  io = ioInstance;
};

export const registerClient = async (userId: string, socketId: string) => {
  userSockets.set(userId, socketId);
  await deliverOffline(userId);
};

export const unregisterClient = (socketId: string) => {
  for (const [userId, sId] of userSockets.entries()) {
    if (sId === socketId) {
      userSockets.delete(userId);
      break;
    }
  }
};

const deliverOffline = async (userId: string) => {
  const notifications = await prisma.notification.findMany({
    where: { userId, read: false },
  });
  if (!notifications.length) return;
  const socketId = userSockets.get(userId);
  if (!socketId) return;

  notifications.forEach((n) => {
    io.to(socketId).emit(n.type, n.payload);
  });

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
};

const emitOrStore = async (userId: string, type: string, payload: any) => {
  const socketId = userSockets.get(userId);
  if (socketId && io.sockets.sockets.get(socketId)) {
    io.to(socketId).emit(type, payload);
  } else {
    await prisma.notification.create({
      data: { userId, type, payload, read: false },
    });
  }
};

export const notifyPropertyUpdate = (userId: string, payload: any) =>
  emitOrStore(userId, 'property:update', payload);

export const notifyNewMessage = (userId: string, payload: any) =>
  emitOrStore(userId, 'message:new', payload);

export const notifyPaymentStatus = (userId: string, payload: any) =>
  emitOrStore(userId, 'payment:status', payload);
