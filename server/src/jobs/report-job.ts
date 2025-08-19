import cron from 'node-cron';
import nodemailer from 'nodemailer';
import prisma from '../utils/prisma';
import { getManagerAnalytics } from '../services/analytics-service';

const transporter = nodemailer.createTransport({ sendmail: true });

const generatePdfBuffer = (data: any): Buffer => {
  const content = `Analytics Report\nOccupancy: ${data.occupancyRate}%\nRevenue: $${data.totalRevenue}`;
  return Buffer.from(content, 'utf-8');
};

const generateCsvBuffer = (data: any): Buffer => {
  const lines = [
    'metric,value',
    `occupancyRate,${data.occupancyRate}`,
    `totalRevenue,${data.totalRevenue}`,
    ...Object.entries(data.applicationFunnel).map(
      ([status, count]) => `applications_${status},${count}`,
    ),
  ];
  return Buffer.from(lines.join('\n'), 'utf-8');
};

export const runMonthlyReport = async (): Promise<void> => {
  const managers = await prisma.manager.findMany();
  for (const manager of managers) {
    const analytics = await getManagerAnalytics(manager.cognitoId);
    const attachments = [
      { filename: 'report.pdf', content: generatePdfBuffer(analytics) },
      { filename: 'report.csv', content: generateCsvBuffer(analytics) },
    ];
    await transporter.sendMail({
      to: manager.email,
      subject: 'Monthly Analytics Report',
      text: 'Attached are your analytics reports.',
      attachments,
    });
  }
};

export const scheduleMonthlyReports = () => {
  cron.schedule('0 0 1 * *', () => {
    void runMonthlyReport();
  });
};
