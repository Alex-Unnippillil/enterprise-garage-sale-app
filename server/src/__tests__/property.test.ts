import request from "supertest";
import express from "express";
import propertyRoutes from "../routes/propertyRoutes";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use("/properties", propertyRoutes);

const describeOrSkip = process.env.DATABASE_URL ? describe : describe.skip;

describeOrSkip("Property API", () => {
  beforeEach(async () => {
    await prisma.property.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns 404 for missing property", async () => {
    const res = await request(app).get("/properties/9999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Property not found" });
  });
});
