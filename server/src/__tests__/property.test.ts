import request from "supertest";
import express from "express";

// mocks must be defined before imports that use them
jest.mock("../utils/s3Upload", () => ({
  uploadFilesToS3: jest.fn().mockResolvedValue([]),
}));

jest.mock("../utils/geocodeAddress", () => ({
  geocodeAddress: jest.fn().mockResolvedValue([0, 0]),
}));

const mockPrisma = {
  property: {
    deleteMany: jest.fn(),
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: { join: jest.fn() },
}));

import propertyRoutes from "../routes/propertyRoutes";
import { createProperty } from "../controllers/propertyControllers";
import prisma from "../utils/prisma";

const app = express();
app.use(express.json());
// custom route to bypass auth and file upload middleware
app.post("/properties", (req, res, next) => {
  (req as any).files = [];
  createProperty(req, res, next);
});
// other property routes
app.use("/properties", propertyRoutes);

const describeOrSkip = process.env.DATABASE_URL ? describe : describe.skip;

describeOrSkip("Property API", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await prisma.property.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns 404 for missing property", async () => {
    mockPrisma.property.findUnique.mockResolvedValue(null);
    const res = await request(app).get("/properties/9999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Property not found" });
  });

  it("creates property with valid payload", async () => {
    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        $queryRaw: jest
          .fn()
          .mockResolvedValue([
            {
              id: 1,
              address: "123",
              city: "Town",
              state: "ST",
              country: "USA",
              postalCode: "00000",
              coordinates: "",
            },
          ]),
        property: {
          create: jest
            .fn()
            .mockResolvedValue({
              id: 1,
              name: "My Property",
              locationId: 1,
              managerCognitoId: "manager",
              location: {},
              manager: {},
            }),
        },
      };
      return cb(tx);
    });

    const payload = {
      address: "123 Main St",
      city: "Townsville",
      state: "TS",
      country: "USA",
      postalCode: "12345",
      managerCognitoId: "manager",
      name: "My Property",
      description: "Nice place",
      pricePerMonth: "1000",
      securityDeposit: "500",
      applicationFee: "50",
      beds: "2",
      baths: "1",
      squareFeet: "900",
      propertyType: "Apartment",
    };

    const res = await request(app).post("/properties").send(payload);
    expect(res.status).toBe(201);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it("returns 400 for invalid payload", async () => {
    const invalidPayload = {
      address: "123 Main St",
      city: "Townsville",
      state: "TS",
      country: "USA",
      postalCode: "12345",
      managerCognitoId: "manager",
      // name missing
      description: "Nice place",
      pricePerMonth: "1000",
      securityDeposit: "500",
      applicationFee: "50",
      beds: "2",
      baths: "1",
      squareFeet: "900",
      propertyType: "Apartment",
    };

    const res = await request(app).post("/properties").send(invalidPayload);
    expect(res.status).toBe(400);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});

