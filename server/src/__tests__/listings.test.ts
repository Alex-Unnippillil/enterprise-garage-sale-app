import request from "supertest";
import express from "express";
import listingsRouter from "../routes/listings";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use("/listings", listingsRouter);

describe("Listings API", () => {
  beforeEach(async () => {
    await prisma.listing.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates and retrieves a listing", async () => {
    const createRes = await request(app)
      .post("/listings")
      .send({ title: "Bike", description: "Mountain bike", price: 100 });
    expect(createRes.status).toBe(201);

    const id = createRes.body.id;
    const getRes = await request(app).get(`/listings/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.title).toBe("Bike");
  });

  it("updates a listing", async () => {
    const listing = await prisma.listing.create({
      data: { title: "Old", description: "Old", price: 10 },
    });
    const res = await request(app)
      .put(`/listings/${listing.id}`)
      .send({ title: "New", description: "New", price: 20 });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("New");
  });

  it("deletes a listing", async () => {
    const listing = await prisma.listing.create({
      data: { title: "Trash", description: "To delete", price: 5 },
    });
    const res = await request(app).delete(`/listings/${listing.id}`);
    expect(res.status).toBe(204);
  });

  it("filters, sorts, and paginates listings", async () => {
    await prisma.listing.createMany({
      data: [
        { title: "Cheap Bike", description: "A", price: 50 },
        { title: "Expensive Bike", description: "B", price: 150 },
        { title: "Car", description: "C", price: 2000 },
      ],
    });

    const res = await request(app)
      .get("/listings")
      .query({
        q: "bike",
        minPrice: 50,
        maxPrice: 200,
        sortBy: "price",
        order: "desc",
        page: 1,
        limit: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Expensive Bike");
    expect(res.headers["x-total-count"]).toBe("2");
  });
});
