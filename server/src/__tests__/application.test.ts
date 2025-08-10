import { mockData } from '../test-utils/prismaMock';
import request from 'supertest';
import express from 'express';
import applicationRouter from '../routes/applicationRoutes';

jest.mock('../middleware/authMiddleware', () => ({
  authMiddleware: () => (_req: any, _res: any, next: any) => next(),
}));

const app = express();
app.use(express.json());
app.use('/applications', applicationRouter);

beforeEach(() => {
  mockData.properties.length = 0;
  mockData.applications.length = 0;
  mockData.leases.length = 0;
  jest.clearAllMocks();
});

describe('Application workflow', () => {
  it('creates an application and lease', async () => {
    mockData.properties.push({
      id: 1,
      pricePerMonth: 1000,
      securityDeposit: 500,
    });

    const res = await request(app).post('/applications').send({
      applicationDate: '2024-01-01',
      status: 'Pending',
      propertyId: 1,
      tenantCognitoId: 'tenant-1',
      name: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '1234567890',
      message: 'Interested',
    });

    expect(res.status).toBe(201);
    expect(mockData.applications.length).toBe(1);
    expect(mockData.leases.length).toBe(1);
  });

  it('returns 404 when property is missing', async () => {
    const res = await request(app).post('/applications').send({
      applicationDate: '2024-01-01',
      status: 'Pending',
      propertyId: 99,
      tenantCognitoId: 'tenant-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phoneNumber: '9876543210',
      message: 'Hi',
    });
    expect(res.status).toBe(404);
    expect(mockData.applications.length).toBe(0);
  });
});
