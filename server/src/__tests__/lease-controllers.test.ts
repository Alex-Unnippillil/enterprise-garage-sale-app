import { Request, Response, NextFunction } from "express";

// Mock external services
jest.mock("../utils/s3Upload", () => ({ uploadFilesToS3: jest.fn() }));
jest.mock("../utils/geocodeAddress", () => ({ geocodeAddress: jest.fn() }));

const mockPrisma = {
  lease: { findMany: jest.fn() },
  payment: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  $disconnect: jest.fn(),
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: { join: jest.fn() },
}));

import prisma from "../utils/prisma";
import {
  getLeases,
  getLeasePayments,
  createPayment,
  updatePayment,
} from "../controllers/lease-controllers";

const createMockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("leaseControllers", () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns leases", async () => {
    mockPrisma.lease.findMany.mockResolvedValue([{ id: 1 }]);
    const req = {} as Request;
    const res = createMockRes();

    await getLeases(req, res, next);

    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it("calls next on lease error", async () => {
    mockPrisma.lease.findMany.mockRejectedValue(new Error("db"));
    const req = {} as Request;
    const res = createMockRes();
    const localNext = jest.fn();

    await getLeases(req, res, localNext);

    expect(localNext).toHaveBeenCalled();
  });

  it("returns lease payments", async () => {
    mockPrisma.payment.findMany.mockResolvedValue([{ id: 1 }]);
    const req = { params: { id: "1" } } as unknown as Request;
    const res = createMockRes();

    await getLeasePayments(req, res, next);

    expect(mockPrisma.payment.findMany).toHaveBeenCalledWith({
      where: { leaseId: 1 },
    });
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it("calls next on payment error", async () => {
    mockPrisma.payment.findMany.mockRejectedValue(new Error("db"));
    const req = { params: { id: "1" } } as unknown as Request;
    const res = createMockRes();
    const localNext = jest.fn();

    await getLeasePayments(req, res, localNext);

    expect(localNext).toHaveBeenCalled();
  });

  it("creates payment with valid payload", async () => {
    mockPrisma.payment.create.mockResolvedValue({ id: 1 });
    const req = {
      params: { id: "1" },
      body: {
        amountDue: 1000,
        amountPaid: 500,
        dueDate: "2024-05-01",
        paymentStatus: "Pending",
      },
    } as unknown as Request;
    const res = createMockRes();

    await createPayment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockPrisma.payment.create).toHaveBeenCalledWith({
      data: {
        amountDue: 1000,
        amountPaid: 500,
        dueDate: new Date("2024-05-01"),
        paymentStatus: "Pending",
        paymentDate: expect.any(Date),
        leaseId: 1,
      },
    });
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("returns 400 for invalid payment payload", async () => {
    const req = {
      params: { id: "1" },
      body: { amountDue: "abc" },
    } as unknown as Request;
    const res = createMockRes();

    await createPayment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.payment.create).not.toHaveBeenCalled();
  });

  it("calls next on create payment error", async () => {
    mockPrisma.payment.create.mockRejectedValue(new Error("db"));
    const req = {
      params: { id: "1" },
      body: {
        amountDue: 1000,
        amountPaid: 500,
        dueDate: "2024-05-01",
        paymentStatus: "Pending",
      },
    } as unknown as Request;
    const res = createMockRes();
    const localNext = jest.fn();

    await createPayment(req, res, localNext);

    expect(localNext).toHaveBeenCalled();
  });

  it("updates payment with valid payload", async () => {
    mockPrisma.payment.update.mockResolvedValue({ id: 1 });
    const req = {
      params: { paymentId: "1" },
      body: { amountPaid: 800 },
    } as unknown as Request;
    const res = createMockRes();

    await updatePayment(req, res, next);

    expect(mockPrisma.payment.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { amountPaid: 800 },
    });
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("returns 400 for invalid payment update", async () => {
    const req = {
      params: { paymentId: "1" },
      body: { amountPaid: "abc" },
    } as unknown as Request;
    const res = createMockRes();

    await updatePayment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.payment.update).not.toHaveBeenCalled();
  });

  it("calls next on update payment error", async () => {
    mockPrisma.payment.update.mockRejectedValue(new Error("db"));
    const req = {
      params: { paymentId: "1" },
      body: { amountPaid: 800 },
    } as unknown as Request;
    const res = createMockRes();
    const localNext = jest.fn();

    await updatePayment(req, res, localNext);

    expect(localNext).toHaveBeenCalled();
  });
});

