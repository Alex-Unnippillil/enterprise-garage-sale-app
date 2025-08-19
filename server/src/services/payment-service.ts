import Stripe from 'stripe';
import prisma from '../utils/prisma';
import { STRIPE_SECRET_KEY } from '../env';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });

export const createCharge = async (
  tenantId: string,
  leaseId: number,
  amount: number
) => {
  const intent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: { tenantId, leaseId: String(leaseId) },
  });

  await prisma.payment.create({
    data: {
      amountDue: amount,
      amountPaid: 0,
      dueDate: new Date(),
      paymentDate: new Date(),
      paymentStatus: 'Pending',
      leaseId,
      stripePaymentIntentId: intent.id,
    },
  });

  return intent.client_secret;
};

export const getPaymentHistory = async (tenantId: string) => {
  return prisma.payment.findMany({
    where: { lease: { tenantCognitoId: tenantId } },
    orderBy: { paymentDate: 'desc' },
  });
};

export const handleWebhook = async (event: Stripe.Event) => {
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    await prisma.payment.update({
      where: { stripePaymentIntentId: intent.id },
      data: {
        paymentStatus: 'Paid',
        amountPaid: intent.amount_received,
        paymentDate: new Date(),
      },
    });
  }
};
