import request from 'supertest';
import express from 'express';
import prisma from '../utils/prisma';

process.env.GEOCODE_USER_AGENT = 'test-agent';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const propertyRoutes = require('../routes/propertyRoutes').default;
const app = express();
app.use(express.json());
app.use('/properties', propertyRoutes);

const describeOrSkip = process.env.DATABASE_URL ? describe : describe.skip;

describeOrSkip('Property search', () => {
  const createProperty = async (name: string, description: string) => {
    const managerId = name.replace(/\s+/g, '-') + '-mgr';
    await prisma.manager.create({
      data: {
        cognitoId: managerId,
        name: 'Manager',
        email: `${managerId}@example.com`,
        phoneNumber: '1234567890',
      },
    });

    const [location] = await prisma.$queryRaw<{ id: number }[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES ('123 Main St', 'City', 'State', 'Country', '12345', ST_SetSRID(ST_MakePoint(0,0), 4326))
      RETURNING id;
    `;

    await prisma.property.create({
      data: {
        name,
        description,
        pricePerMonth: 1000,
        securityDeposit: 500,
        applicationFee: 50,
        photoUrls: [],
        amenities: [],
        highlights: [],
        isPetsAllowed: false,
        isParkingIncluded: false,
        beds: 1,
        baths: 1,
        squareFeet: 500,
        propertyType: 'Apartment',
        locationId: location.id,
        managerCognitoId: managerId,
      },
    });
  };

  beforeEach(async () => {
    await prisma.property.deleteMany();
    await prisma.manager.deleteMany();
    await prisma.location.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns properties matching q', async () => {
    await createProperty('Cozy Cottage', 'A lovely place');
    await createProperty('Modern Loft', 'Stylish design');

    const res = await request(app).get('/properties').query({ q: 'cozy' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Cozy Cottage');
  });

  it('returns empty array when no match', async () => {
    await createProperty('Cozy Cottage', 'A lovely place');

    const res = await request(app).get('/properties').query({ q: 'nonexistent' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});
