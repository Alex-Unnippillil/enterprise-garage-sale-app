import { dispatchNotification, setNotificationPreference } from '../services/notification-service';
import prisma from '../utils/prisma';

const mockSnsSend = jest.fn();
const mockSesSend = jest.fn();

jest.mock('../env', () => ({
  AWS_REGION: 'us-east-1',
  SNS_TOPIC_ARN: 'arn:test',
  SES_FROM_ADDRESS: 'test@example.com',
}));

jest.mock('@aws-sdk/client-sns', () => ({
  SNSClient: jest.fn(() => ({ send: mockSnsSend })),
  PublishCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-ses', () => ({
  SESClient: jest.fn(() => ({ send: mockSesSend })),
  SendEmailCommand: jest.fn(),
}));

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    notificationPreference: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

describe('notification service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches through SNS and SES when opted in', async () => {
    (prisma.notificationPreference.findUnique as jest.Mock).mockResolvedValue({
      userCognitoId: 'user1',
      email: 'user1@test.com',
      phoneNumber: '+1234567890',
      emailOptIn: true,
      smsOptIn: true,
    });
    await dispatchNotification('user1', 'hello');
    expect(mockSnsSend).toHaveBeenCalled();
    expect(mockSesSend).toHaveBeenCalled();
  });

  it('does not dispatch when opted out', async () => {
    (prisma.notificationPreference.findUnique as jest.Mock).mockResolvedValue({
      userCognitoId: 'user1',
      emailOptIn: false,
      smsOptIn: false,
    });
    await dispatchNotification('user1', 'hello');
    expect(mockSnsSend).not.toHaveBeenCalled();
    expect(mockSesSend).not.toHaveBeenCalled();
  });

  it('updates notification preferences', async () => {
    (prisma.notificationPreference.upsert as jest.Mock).mockResolvedValue({});
    await setNotificationPreference('user1', { emailOptIn: false });
    expect(prisma.notificationPreference.upsert).toHaveBeenCalledWith({
      where: { userCognitoId: 'user1' },
      update: { emailOptIn: false },
      create: { userCognitoId: 'user1', emailOptIn: false },
    });
  });
});
