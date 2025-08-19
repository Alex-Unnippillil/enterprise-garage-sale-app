import { runMonthlyReport } from '../jobs/report-job';

const mockPrisma = {
  manager: { findMany: jest.fn() },
};

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

const analyticsMock = jest.fn();
jest.mock('../services/analytics-service', () => ({
  getManagerAnalytics: analyticsMock,
}));

const sendMailMock = jest.fn().mockResolvedValue({});
jest.mock('nodemailer', () => ({
  createTransport: () => ({ sendMail: sendMailMock }),
}));

describe('report-job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends reports to managers', async () => {
    mockPrisma.manager.findMany.mockResolvedValue([
      { cognitoId: 'm1', email: 'test@example.com' },
    ]);
    analyticsMock.mockResolvedValue({
      occupancyRate: 80,
      totalRevenue: 1000,
      applicationFunnel: { Pending: 1, Approved: 2, Denied: 0 },
    });

    await runMonthlyReport();

    expect(analyticsMock).toHaveBeenCalledWith('m1');
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
      }),
    );
    const attachments = sendMailMock.mock.calls[0][0].attachments;
    expect(Array.isArray(attachments)).toBe(true);
    expect(attachments).toHaveLength(2);
  });
});
