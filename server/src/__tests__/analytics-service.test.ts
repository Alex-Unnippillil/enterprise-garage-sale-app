import { getManagerAnalytics } from '../services/analytics-service';

const mockPrisma = {
  property: { count: jest.fn() },
  lease: { count: jest.fn() },
  payment: { aggregate: jest.fn() },
  application: { groupBy: jest.fn() },
};

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

describe('analytics-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates analytics metrics', async () => {
    mockPrisma.property.count.mockResolvedValue(10);
    mockPrisma.lease.count.mockResolvedValue(8);
    mockPrisma.payment.aggregate.mockResolvedValue({ _sum: { amountPaid: 5000 } });
    mockPrisma.application.groupBy.mockResolvedValue([
      { status: 'Pending', _count: { _all: 2 } },
      { status: 'Approved', _count: { _all: 3 } },
    ]);

    const result = await getManagerAnalytics('manager1');

    expect(result).toEqual({
      occupancyRate: 80,
      totalRevenue: 5000,
      applicationFunnel: { Pending: 2, Approved: 3, Denied: 0 },
    });

    expect(mockPrisma.property.count).toHaveBeenCalled();
    expect(mockPrisma.lease.count).toHaveBeenCalled();
    expect(mockPrisma.payment.aggregate).toHaveBeenCalled();
    expect(mockPrisma.application.groupBy).toHaveBeenCalled();
  });
});
