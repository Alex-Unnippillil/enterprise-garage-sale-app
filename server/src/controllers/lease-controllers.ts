import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

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
