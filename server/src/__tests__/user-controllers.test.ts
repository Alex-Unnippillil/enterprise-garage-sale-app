import request from "supertest";
import express from "express";

const mockPrisma = {
  tenant: {
    create: jest.fn(),
    update: jest.fn(),
  },
  manager: {
    create: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock("../utils/prisma", () => ({
  __esModule: true,
  default: mockPrisma,
}));

import { createTenant, updateTenant } from "../controllers/tenant-controllers";
import { createManager, updateManager } from "../controllers/manager-controllers";

const app = express();
app.use(express.json());
app.post("/tenants", createTenant);
app.put("/tenants/:cognitoId", updateTenant);
app.post("/managers", createManager);
app.put("/managers/:cognitoId", updateManager);

describe("Tenant validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates tenant with valid payload", async () => {
    mockPrisma.tenant.create.mockResolvedValue({ id: 1 });
    const res = await request(app).post("/tenants").send({
      cognitoId: "abc",
      name: "John Doe",
      email: "john@example.com",
      phoneNumber: "1234567890",
    });
    expect(res.status).toBe(201);
    expect(mockPrisma.tenant.create).toHaveBeenCalled();
  });

  it("returns 400 for invalid tenant payload", async () => {
    const res = await request(app).post("/tenants").send({
      cognitoId: "abc",
      name: "John Doe",
      phoneNumber: "123",
    });
    expect(res.status).toBe(400);
    expect(mockPrisma.tenant.create).not.toHaveBeenCalled();
  });

  it("updates tenant with valid payload", async () => {
    mockPrisma.tenant.update.mockResolvedValue({ id: 1 });
    const res = await request(app).put("/tenants/abc").send({
      name: "Jane Doe",
      email: "jane@example.com",
      phoneNumber: "0987654321",
    });
    expect(res.status).toBe(200);
    expect(mockPrisma.tenant.update).toHaveBeenCalled();
  });

  it("returns 400 for invalid tenant update", async () => {
    const res = await request(app).put("/tenants/abc").send({
      name: "Jane Doe",
    });
    expect(res.status).toBe(400);
    expect(mockPrisma.tenant.update).not.toHaveBeenCalled();
  });
});

describe("Manager validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates manager with valid payload", async () => {
    mockPrisma.manager.create.mockResolvedValue({ id: 1 });
    const res = await request(app).post("/managers").send({
      cognitoId: "abc",
      name: "John Manager",
      email: "manager@example.com",
      phoneNumber: "1234567890",
    });
    expect(res.status).toBe(201);
    expect(mockPrisma.manager.create).toHaveBeenCalled();
  });

  it("returns 400 for invalid manager payload", async () => {
    const res = await request(app).post("/managers").send({
      cognitoId: "abc",
      name: "John Manager",
      phoneNumber: "123",
    });
    expect(res.status).toBe(400);
    expect(mockPrisma.manager.create).not.toHaveBeenCalled();
  });

  it("updates manager with valid payload", async () => {
    mockPrisma.manager.update.mockResolvedValue({ id: 1 });
    const res = await request(app).put("/managers/abc").send({
      name: "Jane Manager",
      email: "jane.manager@example.com",
      phoneNumber: "0987654321",
    });
    expect(res.status).toBe(200);
    expect(mockPrisma.manager.update).toHaveBeenCalled();
  });

  it("returns 400 for invalid manager update", async () => {
    const res = await request(app).put("/managers/abc").send({
      name: "Jane Manager",
    });
    expect(res.status).toBe(400);
    expect(mockPrisma.manager.update).not.toHaveBeenCalled();
  });
});
