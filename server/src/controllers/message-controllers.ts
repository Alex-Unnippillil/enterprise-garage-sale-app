import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { getMessages as getMessagesService } from '../services/message-service';

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const conversationId = Number(req.params.conversationId);
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    const userId = req.user?.id;
    if (userId !== conversation.tenantCognitoId && userId !== conversation.managerCognitoId) {
      res.status(403).json({ message: 'Access Denied' });
      return;
    }

    const messages = await getMessagesService(conversationId);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};
