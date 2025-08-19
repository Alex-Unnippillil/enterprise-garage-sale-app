const store: Record<string, boolean> = {};

const mockPrisma = {
  featureFlag: {
    findMany: jest.fn(async () =>
      Object.entries(store).map(([name, enabled]) => ({ name, enabled }))
    ),
    findUnique: jest.fn(async ({ where: { name } }) =>
      store[name] !== undefined ? { name, enabled: store[name] } : null
    ),
    upsert: jest.fn(async ({ where: { name }, update, create }) => {
      store[name] = update.enabled ?? create.enabled;
    }),
  },
};

jest.mock('../prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import { setFeature, isFeatureEnabled, getAllFlags } from '../feature-flags';

describe('feature flags service', () => {
  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key];
  });

  test('set and get flag', async () => {
    await setFeature('test-flag', true);
    expect(await isFeatureEnabled('test-flag')).toBe(true);

    await setFeature('test-flag', false);
    expect(await isFeatureEnabled('test-flag')).toBe(false);
  });

  test('getAllFlags returns map', async () => {
    await setFeature('a', true);
    await setFeature('b', false);
    const flags = await getAllFlags();
    expect(flags).toMatchObject({ a: true, b: false });
  });
});
