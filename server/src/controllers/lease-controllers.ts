import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { dispatchNotification } from '../services/notification-service';

export const getLeases = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leases = await prisma.lease.findMany({
      include: {
        tenant: true,
        property: true,
      },
    });
    res.json(leases);
  } catch (error) {
    next(error);
  }
};

export const getLeasePayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const payments = await prisma.payment.findMany({
      where: { leaseId: Number(id) },
    });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

const paymentSchema = z.object({
  amountDue: z.coerce.number(),
  amountPaid: z.coerce.number(),
});

const updatePaymentSchema = paymentSchema.partial();

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const parsed = paymentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.errors });
      return;
    }
    const payment = await prisma.payment.create({
      data: {
        ...parsed.data,
        leaseId: Number(id),
        dueDate: new Date(),
        paymentDate: new Date(),
        paymentStatus: 'PENDING' as any,
      },
    });
    res.status(201).json(payment);
    if ((req as any).user?.id) {
      await dispatchNotification((req as any).user.id, 'Payment created');
    }
  } catch (error) {
    next(error);
  }
};

export const updatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const parsed = updatePaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.errors });
      return;
    }

    const payment = await prisma.payment.update({
      where: { id: Number(paymentId) },
      data: parsed.data,
    });
    res.json(payment);
    if ((req as any).user?.id) {
      await dispatchNotification((req as any).user.id, 'Payment updated');
    }
  } catch (error) {
    next(error);
  }
};
