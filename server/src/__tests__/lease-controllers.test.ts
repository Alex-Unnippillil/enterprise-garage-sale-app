import { Request, Response, NextFunction } from "express";

// Mock external services
jest.mock("../utils/s3Upload", () => ({ uploadFilesToS3: jest.fn() }));
jest.mock("../utils/geocodeAddress", () => ({ geocodeAddress: jest.fn() }));

const mockPrisma = {
  lease: { findMany: jest.fn() },
  payment: { findMany: jest.fn() },
  $disconnect: jest.fn(),
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: { join: jest.fn() },
}));

import prisma from "../utils/prisma";
import { getLeases, getLeasePayments } from "../controllers/lease-controllers";

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
});

