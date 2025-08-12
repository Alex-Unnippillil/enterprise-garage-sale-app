import request from "supertest";
import express from "express";

const mockPrisma = {
  property: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  $queryRaw: jest.fn(),
  $transaction: jest.fn(),
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: { join: (vals: any[]) => vals },
}));

jest.mock("../middleware/authMiddleware", () => ({
  authMiddleware: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock("../utils/s3Upload", () => ({
  uploadFilesToS3: jest.fn(),
}));

jest.mock("../utils/geocodeAddress", () => ({
  geocodeAddress: jest.fn(),
}));

import propertyRoutes from "../routes/propertyRoutes";
import { uploadFilesToS3 } from "../utils/s3Upload";
import { geocodeAddress } from "../utils/geocodeAddress";

const app = express();
app.use(express.json());
app.use("/properties", propertyRoutes);

describe("Property API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 for missing property", async () => {
    mockPrisma.property.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/properties/9999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Property not found" });
  });

  it("retrieves a property", async () => {
    const property = {
      id: 1,
      name: "Test",
      description: "desc",
      pricePerMonth: 1000,
      securityDeposit: 100,
      applicationFee: 50,
      photoUrls: [],
      amenities: [],
      highlights: [],
      isPetsAllowed: false,
      isParkingIncluded: false,
      beds: 2,
      baths: 1,
      squareFeet: 800,
      propertyType: "Apartment",
      postedDate: new Date(),
      averageRating: 0,
      numberOfReviews: 0,
      locationId: 10,
      managerCognitoId: "mgr1",
      location: {
        id: 10,
        address: "123",
        city: "City",
        state: "ST",
        country: "US",
        postalCode: "12345",
      },
    };
    mockPrisma.property.findUnique.mockResolvedValue(property);
    mockPrisma.$queryRaw.mockResolvedValue([{ coordinates: "POINT(1 2)" }]);

    const res = await request(app).get("/properties/1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.location.coordinates).toEqual({ longitude: 1, latitude: 2 });
  });

  it("lists properties with filters", async () => {
    const properties = [
      {
        id: 1,
        name: "Test",
        description: "desc",
        pricePerMonth: 1000,
        securityDeposit: 100,
        applicationFee: 50,
        photoUrls: [],
        amenities: [],
        highlights: [],
        isPetsAllowed: false,
        isParkingIncluded: false,
        beds: 3,
        baths: 2,
        squareFeet: 900,
        propertyType: "Apartment",
        postedDate: new Date(),
        averageRating: 0,
        numberOfReviews: 0,
        locationId: 10,
        managerCognitoId: "mgr1",
        location: {
          id: 10,
          address: "123",
          city: "City",
          state: "ST",
          country: "US",
          postalCode: "12345",
        },
      },
    ];
    mockPrisma.property.findMany.mockResolvedValue(properties);
    mockPrisma.$queryRaw.mockResolvedValue([{ id: 10, longitude: 1, latitude: 2 }]);

    const res = await request(app).get("/properties?beds_gte=2&baths_gte=1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].location.coordinates).toEqual({ longitude: 1, latitude: 2 });
    expect(mockPrisma.property.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        beds: { gte: 2 },
        baths: { gte: 1 },
      }),
      include: { location: true },
    });
  });

  it("creates a property", async () => {
    (uploadFilesToS3 as jest.Mock).mockResolvedValue(["url1"]);
    (geocodeAddress as jest.Mock).mockResolvedValue([1, 2]);

    const createdProperty = {
      id: 1,
      name: "New",
      description: "desc",
      pricePerMonth: 1000,
      securityDeposit: 100,
      applicationFee: 50,
      photoUrls: ["url1"],
      amenities: [],
      highlights: [],
      isPetsAllowed: false,
      isParkingIncluded: false,
      beds: 2,
      baths: 1,
      squareFeet: 800,
      propertyType: "Apartment",
      postedDate: new Date(),
      averageRating: 0,
      numberOfReviews: 0,
      locationId: 10,
      managerCognitoId: "mgr1",
      location: {
        id: 10,
        address: "123",
        city: "City",
        state: "ST",
        country: "US",
        postalCode: "12345",
      },
      manager: {
        cognitoId: "mgr1",
        name: "Manager",
        email: "m@example.com",
        phoneNumber: "123",
      },
    };

    mockPrisma.$transaction.mockImplementation(async (cb: any) =>
      cb({
        $queryRaw: jest
          .fn()
          .mockResolvedValue([
            {
              id: 10,
              address: "123",
              city: "City",
              state: "ST",
              country: "US",
              postalCode: "12345",
              coordinates: "POINT(1 2)",
            },
          ]),
        property: { create: jest.fn().mockResolvedValue(createdProperty) },
      })
    );

    const res = await request(app)
      .post("/properties")
      .field("name", "New")
      .field("description", "desc")
      .field("pricePerMonth", "1000")
      .field("securityDeposit", "100")
      .field("applicationFee", "50")
      .field("amenities", "")
      .field("highlights", "")
      .field("isPetsAllowed", "false")
      .field("isParkingIncluded", "false")
      .field("beds", "2")
      .field("baths", "1")
      .field("squareFeet", "800")
      .field("address", "123")
      .field("city", "City")
      .field("state", "ST")
      .field("country", "US")
      .field("postalCode", "12345")
      .field("managerCognitoId", "mgr1")
      .attach("photos", Buffer.from("fake"), "photo.jpg");

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("New");
    expect(uploadFilesToS3).toHaveBeenCalled();
    expect(geocodeAddress).toHaveBeenCalledWith("123", "City", "US", "12345");
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });
});

