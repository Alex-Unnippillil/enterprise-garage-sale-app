import { Request, Response, NextFunction } from "express";

const mockPrisma = {
  payment: {
    create: jest.fn(),
    update: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: { join: jest.fn() },
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
      body: { amountDue: 100, amountPaid: 50 },
    } as unknown as Request;
    const res = createMockRes();

    await createPayment(req, res, next);

    expect(mockPrisma.payment.create).toHaveBeenCalledWith({
      data: { leaseId: 1, amountDue: 100, amountPaid: 50 },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("returns 400 for invalid create payload", async () => {
    const req = { params: { id: "1" }, body: {} } as unknown as Request;
    const res = createMockRes();

    await createPayment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.payment.create).not.toHaveBeenCalled();
  });

  it("updates a payment", async () => {
    mockPrisma.payment.update.mockResolvedValue({ id: 1, amountPaid: 75 });

    const req = {
      params: { paymentId: "1" },
      body: { amountPaid: 75 },
    } as unknown as Request;
    const res = createMockRes();

    await updatePayment(req, res, next);

    expect(mockPrisma.payment.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { amountPaid: 75 },
    });
    expect(res.json).toHaveBeenCalledWith({ id: 1, amountPaid: 75 });
  });

  it("returns 400 for invalid update payload", async () => {
    const req = {
      params: { paymentId: "1" },
      body: { amountPaid: "invalid" },
    } as unknown as Request;
    const res = createMockRes();

    await updatePayment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.payment.update).not.toHaveBeenCalled();
  });
});

