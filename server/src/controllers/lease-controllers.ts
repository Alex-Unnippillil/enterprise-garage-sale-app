import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";

const createPaymentSchema = z.object({
  amountDue: z.coerce.number(),
  amountPaid: z.coerce.number(),
  dueDate: z.coerce.date(),
  paymentStatus: z.enum([
    "Pending",
    "Paid",
    "PartiallyPaid",
    "Overdue",
  ]),
});

const updatePaymentSchema = z.object({
  amountDue: z.coerce.number().optional(),
  amountPaid: z.coerce.number().optional(),
  dueDate: z.coerce.date().optional(),
  paymentStatus: z
    .enum(["Pending", "Paid", "PartiallyPaid", "Overdue"])
    .optional(),
});

export const getLeases = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
  next: NextFunction
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

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = createPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten() });
      return;
    }

    const { id } = req.params;
    const payment = await prisma.payment.create({
      data: {
        ...parsed.data,
        leaseId: Number(id),
        paymentDate: new Date(),
      },
    });
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

export const updatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const parsed = updatePaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten() });
      return;
    }

    const payment = await prisma.payment.update({
      where: { id: Number(paymentId) },
      data: parsed.data,
    });
    res.json(payment);
  } catch (error) {
    next(error);
  }
};
