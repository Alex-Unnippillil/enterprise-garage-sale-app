import { Request, Response, NextFunction } from "express";

// Mock external services
jest.mock("../utils/s3-upload", () => ({ uploadFilesToS3: jest.fn() }));
jest.mock("../utils/geocode-address", () => ({ geocodeAddress: jest.fn() }));

const mockPrisma = {
  tenant: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  property: { findMany: jest.fn() },
  $queryRaw: jest.fn(),
  $disconnect: jest.fn(),
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: { join: jest.fn() },
}));

import prisma from "../utils/prisma";
import { getTenant, createTenant, updateTenant } from "../controllers/tenant-controllers";

const createMockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("tenantControllers", () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns tenant when found", async () => {
    mockPrisma.tenant.findUnique.mockResolvedValue({ cognitoId: "abc" });
    const req = { params: { cognitoId: "abc" } } as unknown as Request;
    const res = createMockRes();

    await getTenant(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ cognitoId: "abc" });
  });

  it("returns 404 when tenant missing", async () => {
    mockPrisma.tenant.findUnique.mockResolvedValue(null);
    const req = { params: { cognitoId: "missing" } } as unknown as Request;
    const res = createMockRes();

    await getTenant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Tenant not found" });
  });

  it("updates tenant with provided fields", async () => {
    mockPrisma.tenant.update.mockResolvedValue({
      cognitoId: "abc",
      name: "New Name",
    });
    const req = {
      params: { cognitoId: "abc" },
      body: { name: "New Name" },
    } as unknown as Request;
    const res = createMockRes();

    await updateTenant(req, res, next);

    expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
      where: { cognitoId: "abc" },
      data: { name: "New Name" },
    });
    expect(res.json).toHaveBeenCalledWith({ cognitoId: "abc", name: "New Name" });
  });

  it("returns 400 when no update fields provided", async () => {
    const req = {
      params: { cognitoId: "abc" },
      body: {},
    } as unknown as Request;
    const res = createMockRes();

    await updateTenant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "No fields provided" });
    expect(mockPrisma.tenant.update).not.toHaveBeenCalled();
  });

  it("calls next on create error", async () => {
    mockPrisma.tenant.create.mockRejectedValue(new Error("fail"));
    const req = {
      body: {
        cognitoId: "1",
        name: "a",
        email: "e@example.com",
        phoneNumber: "1234567890",
      },
    } as unknown as Request;
    const res = createMockRes();
    const localNext = jest.fn();

    await createTenant(req, res, localNext);

    expect(localNext).toHaveBeenCalled();
  });
});

