import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '../env';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

export const createCharge = async (
  amount: number,
  metadata: Record<string, string>,
) => {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    payment_method_types: ['card'],
    metadata,
  });
};

export const verifyWebhook = (payload: Buffer | string, signature: string) => {
  return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
};

export default {
  createCharge,
  verifyWebhook,
};
