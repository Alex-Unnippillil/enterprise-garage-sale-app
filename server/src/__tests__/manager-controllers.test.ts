import { Request, Response, NextFunction } from "express";

// Mock external services
jest.mock("../utils/s3Upload", () => ({ uploadFilesToS3: jest.fn() }));
jest.mock("../utils/geocodeAddress", () => ({ geocodeAddress: jest.fn() }));

jest.mock("@terraformer/wkt", () => ({
  wktToGeoJSON: jest.fn().mockReturnValue({ coordinates: [1, 2] }),
}));

const mockPrisma = {
  manager: {
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
import { getManager, getManagerProperties } from "../controllers/manager-controllers";

const createMockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("managerControllers", () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns manager when found", async () => {
    mockPrisma.manager.findUnique.mockResolvedValue({ cognitoId: "m1" });
    const req = { params: { cognitoId: "m1" } } as unknown as Request;
    const res = createMockRes();

    await getManager(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ cognitoId: "m1" });
  });

  it("returns 404 when manager missing", async () => {
    mockPrisma.manager.findUnique.mockResolvedValue(null);
    const req = { params: { cognitoId: "m1" } } as unknown as Request;
    const res = createMockRes();

    await getManager(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Manager not found" });
  });

  it("lists manager properties with coordinates", async () => {
    mockPrisma.property.findMany.mockResolvedValue([
      {
        id: 1,
        location: { id: 10, address: "addr" },
      },
    ]);
    mockPrisma.$queryRaw.mockResolvedValue([{ coordinates: "POINT(1 2)" }]);

    const req = { params: { cognitoId: "m1" } } as unknown as Request;
    const res = createMockRes();

    await getManagerProperties(req, res, next);

    expect(res.json).toHaveBeenCalledWith([
      {
        id: 1,
        location: {
          id: 10,
          address: "addr",
          coordinates: { longitude: 1, latitude: 2 },
        },
      },
    ]);
  });

  it("calls next on error", async () => {
    mockPrisma.property.findMany.mockRejectedValue(new Error("db"));
    const req = { params: { cognitoId: "m1" } } as unknown as Request;
    const res = createMockRes();
    const localNext = jest.fn();

    await getManagerProperties(req, res, localNext);

    expect(localNext).toHaveBeenCalled();
  });
});

