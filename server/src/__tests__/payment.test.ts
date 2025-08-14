import { Request, Response, NextFunction } from "express";
import { PaymentStatus } from "@prisma/client";

const mockPrisma = {
  payment: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  PaymentStatus: {
    Paid: "Paid",
    PartiallyPaid: "PartiallyPaid",
    Pending: "Pending",
  },
}));

import { createPayment, updatePayment } from "../controllers/lease-controllers";

const createMockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("payment controllers", () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a payment", async () => {
    mockPrisma.payment.create.mockResolvedValue({ id: 1 });
    const req = {
      params: { id: "1" },
      body: { amountDue: 1000, amountPaid: 500 },
    } as unknown as Request;
    const res = createMockRes();

    await createPayment(req, res, next);

    expect(mockPrisma.payment.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("returns 400 when creating payment with invalid data", async () => {
    const req = {
      params: { id: "1" },
      body: { amountDue: "bad" },
    } as unknown as Request;
    const res = createMockRes();

    await createPayment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.payment.create).not.toHaveBeenCalled();
  });

  it("updates a payment", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({ amountDue: 1000, amountPaid: 0 });
    mockPrisma.payment.update.mockResolvedValue({ id: 1 });
    const req = {
      params: { paymentId: "1" },
      body: { amountPaid: 1000 },
    } as unknown as Request;
    const res = createMockRes();

    await updatePayment(req, res, next);

    expect(mockPrisma.payment.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { amountPaid: 1000, paymentStatus: PaymentStatus.Paid },
    });
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("returns 400 when updating payment with invalid data", async () => {
    const req = {
      params: { paymentId: "1" },
      body: { amountPaid: "bad" },
    } as unknown as Request;
    const res = createMockRes();

    await updatePayment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.payment.update).not.toHaveBeenCalled();
  });
});
