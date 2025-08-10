import { mockData } from '../test-utils/prismaMock';
import request from 'supertest';
import express from 'express';
import propertyRouter from '../routes/propertyRoutes';

jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn().mockImplementation(() => ({
    done: jest.fn().mockResolvedValue({ Location: 'https://s3.test/mock.jpg' }),
  })),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
}));

jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: [{ lon: '1', lat: '2' }] }),
}));

jest.mock('../middleware/authMiddleware', () => ({
  authMiddleware: () => (_req: any, _res: any, next: any) => next(),
}));

const app = express();
app.use(express.json());
app.use('/properties', propertyRouter);

beforeAll(() => {
  process.env.S3_BUCKET_NAME = 'bucket';
  process.env.AWS_REGION = 'us-east-1';
});

beforeEach(() => {
  mockData.properties.length = 0;
  mockData.locations.length = 0;
  jest.clearAllMocks();
});

describe('Property workflow', () => {
  const buildRequest = () =>
    request(app)
      .post('/properties')
      .field('name', 'Test Property')
      .field('description', 'Nice place')
      .field('pricePerMonth', '1000')
      .field('securityDeposit', '500')
      .field('applicationFee', '50')
      .field('amenities', 'WasherDryer')
      .field('highlights', 'GreatView')
      .field('isPetsAllowed', 'true')
      .field('isParkingIncluded', 'false')
      .field('beds', '2')
      .field('baths', '1')
      .field('squareFeet', '800')
      .field('propertyType', 'Apartment')
      .field('address', '123 Main')
      .field('city', 'Metropolis')
      .field('state', 'CA')
      .field('country', 'USA')
      .field('postalCode', '90210')
      .field('managerCognitoId', 'manager-1')
      .attach('photos', Buffer.from('fake'), 'photo.jpg');

  it('creates a property and stores it', async () => {
    const res = await buildRequest();
    expect(res.status).toBe(201);
    expect(mockData.properties.length).toBe(1);
    expect(mockData.properties[0].name).toBe('Test Property');
  });

  it('handles S3 upload failure', async () => {
    const { Upload } = require('@aws-sdk/lib-storage');
    (Upload as any).mockImplementationOnce(() => ({
      done: jest.fn().mockRejectedValue(new Error('S3 failure')),
    }));
    const res = await buildRequest();
    expect(res.status).toBe(500);
    expect(mockData.properties.length).toBe(0);
  });
});
