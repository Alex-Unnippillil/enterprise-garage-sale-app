import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { dispatchNotification } from '../services/notification-service';

const messageSchema = z.object({
  recipientId: z.string(),
  message: z.string(),
});

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.errors });
      return;
    }
    const { recipientId, message } = parsed.data;
    await dispatchNotification(recipientId, message);
    res.status(200).json({ status: 'sent' });
  } catch (error) {
    next(error);
  }
};
