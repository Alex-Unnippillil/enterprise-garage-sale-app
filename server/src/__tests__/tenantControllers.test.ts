import { Request, Response, NextFunction } from "express";

// Mock external services
jest.mock("../utils/s3Upload", () => ({ uploadFilesToS3: jest.fn() }));
jest.mock("../utils/geocodeAddress", () => ({ geocodeAddress: jest.fn() }));

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
import { getTenant, createTenant, addFavoriteProperty } from "../controllers/tenantControllers";

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

  it("adds property to favorites", async () => {
    mockPrisma.tenant.findUnique.mockResolvedValue({ favorites: [] });
    mockPrisma.tenant.update.mockResolvedValue({ favorites: [{ id: 1 }] });

    const req = { params: { cognitoId: "t1", propertyId: "1" } } as unknown as Request;
    const res = createMockRes();

    await addFavoriteProperty(req, res, next);

    expect(mockPrisma.tenant.update).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ favorites: [{ id: 1 }] });
  });

  it("returns 409 when property already favorite", async () => {
    mockPrisma.tenant.findUnique.mockResolvedValue({ favorites: [{ id: 1 }] });
    const req = { params: { cognitoId: "t1", propertyId: "1" } } as unknown as Request;
    const res = createMockRes();

    await addFavoriteProperty(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Property already added as favorite" });
  });

  it("calls next on create error", async () => {
    mockPrisma.tenant.create.mockRejectedValue(new Error("fail"));
    const req = {
      body: { cognitoId: "1", name: "a", email: "e", phoneNumber: "p" },
    } as unknown as Request;
    const res = createMockRes();
    const localNext = jest.fn();

    await createTenant(req, res, localNext);

    expect(localNext).toHaveBeenCalled();
  });
});

