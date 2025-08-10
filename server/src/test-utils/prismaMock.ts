export const mockData = {
  properties: [] as any[],
  locations: [] as any[],
  applications: [] as any[],
  leases: [] as any[],
  listings: [] as any[],
};

export const mockPrisma: any = {
  property: {
    create: jest.fn(async ({ data }) => {
      const property = { id: mockData.properties.length + 1, ...data };
      mockData.properties.push(property);
      return property;
    }),
    findUnique: jest.fn(async ({ where: { id } }) =>
      mockData.properties.find((p) => p.id === id) || null
    ),
    update: jest.fn(async ({ where: { id }, data }) => {
      const property = mockData.properties.find((p) => p.id === id);
      return property ? Object.assign(property, data) : null;
    }),
    findMany: jest.fn(async () => mockData.properties),
  },
  application: {
    create: jest.fn(async ({ data }) => {
      const application = { id: mockData.applications.length + 1, ...data };
      mockData.applications.push(application);
      return application;
    }),
    findMany: jest.fn(async () => mockData.applications),
    findUnique: jest.fn(async ({ where: { id } }) =>
      mockData.applications.find((a) => a.id === id) || null
    ),
    update: jest.fn(async ({ where: { id }, data }) => {
      const app = mockData.applications.find((a) => a.id === id);
      return app ? Object.assign(app, data) : null;
    }),
  },
  lease: {
    create: jest.fn(async ({ data }) => {
      const lease = { id: mockData.leases.length + 1, ...data };
      mockData.leases.push(lease);
      return lease;
    }),
  },
  listing: {
    create: jest.fn(async ({ data }) => {
      const listing = { id: mockData.listings.length + 1, ...data };
      mockData.listings.push(listing);
      return listing;
    }),
    findUnique: jest.fn(async ({ where: { id } }) =>
      mockData.listings.find((l) => l.id === id) || null
    ),
    update: jest.fn(async ({ where: { id }, data }) => {
      const listing = mockData.listings.find((l) => l.id === id);
      return listing ? Object.assign(listing, data) : null;
    }),
    delete: jest.fn(async ({ where: { id } }) => {
      const idx = mockData.listings.findIndex((l) => l.id === id);
      if (idx !== -1) mockData.listings.splice(idx, 1);
    }),
    deleteMany: jest.fn(async () => {
      mockData.listings = [];
    }),
    findMany: jest.fn(async () => mockData.listings),
  },
  $transaction: jest.fn(async (cb: any) => cb(mockPrisma)),
  $queryRaw: jest.fn(async (strings: TemplateStringsArray, ...values: any[]) => {
    const [address, city, state, country, postalCode, longitude, latitude] = values;
    const location = {
      id: mockData.locations.length + 1,
      address,
      city,
      state,
      country,
      postalCode,
      coordinates: `POINT(${longitude} ${latitude})`,
    };
    mockData.locations.push(location);
    return [location];
  }),
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: { sql: () => {}, join: () => {} },
}));
