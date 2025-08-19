import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { AWS_REGION, SNS_TOPIC_ARN, SES_FROM_ADDRESS } from '../env';
import prisma from '../utils/prisma';

const sns = new SNSClient({ region: AWS_REGION });
const ses = new SESClient({ region: AWS_REGION });

export const dispatchNotification = async (
  userCognitoId: string,
  message: string,
): Promise<void> => {
  const pref = await prisma.notificationPreference.findUnique({
    where: { userCognitoId },
  });
  if (!pref) return;

  const tasks: Promise<unknown>[] = [];
  if (pref.smsOptIn && pref.phoneNumber && SNS_TOPIC_ARN) {
    tasks.push(
      sns.send(
        new PublishCommand({
          TopicArn: SNS_TOPIC_ARN,
          Message: message,
          PhoneNumber: pref.phoneNumber,
        }),
      ),
    );
  }

  if (pref.emailOptIn && pref.email && SES_FROM_ADDRESS) {
    tasks.push(
      ses.send(
        new SendEmailCommand({
          Source: SES_FROM_ADDRESS,
          Destination: { ToAddresses: [pref.email] },
          Message: {
            Subject: { Data: 'Notification' },
            Body: { Text: { Data: message } },
          },
        }),
      ),
    );
  }

  await Promise.all(tasks);
};

export const setNotificationPreference = async (
  userCognitoId: string,
  data: {
    email?: string;
    phoneNumber?: string;
    emailOptIn?: boolean;
    smsOptIn?: boolean;
  },
) => {
  return prisma.notificationPreference.upsert({
    where: { userCognitoId },
    update: data,
    create: { userCognitoId, ...data },
  });
};
