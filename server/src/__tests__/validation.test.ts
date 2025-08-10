import request from "supertest";
import express from "express";
import listingsRouter from "../routes/listings";
import tenantRouter from "../routes/tenantRoutes";
import propertyRouter from "../routes/propertyRoutes";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use("/listings", listingsRouter);
app.use("/tenants", tenantRouter);
app.use("/properties", propertyRouter);

describe("Payload validation", () => {
  it("rejects invalid listing payload", async () => {
    const res = await request(app).post("/listings").send({ title: 123 });
    expect(res.status).toBe(400);
  });

  it("rejects invalid tenant payload", async () => {
    const res = await request(app)
      .post("/tenants")
      .send({ cognitoId: "abc", name: "John" });
    expect(res.status).toBe(400);
  });

  it("rejects invalid property payload", async () => {
    const token = jwt.sign({ sub: "1", "custom:role": "manager" }, "secret");
    const res = await request(app)
      .post("/properties")
      .set("Authorization", `Bearer ${token}`)
      .field("address", "123 Main St");
    expect(res.status).toBe(400);
  });
});
