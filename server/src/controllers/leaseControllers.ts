import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../middleware/asyncHandler";

const prisma = new PrismaClient();

export const getLeases = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const leases = await prisma.lease.findMany({
      include: {
        tenant: true,
        property: true,
      },
    });
    res.json(leases);
  }
);

export const getLeasePayments = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payments = await prisma.payment.findMany({
      where: { leaseId: Number(id) },
    });
    res.json(payments);
  }
);
