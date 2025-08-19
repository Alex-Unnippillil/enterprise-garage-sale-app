import { Router } from 'express';
import prisma from '../utils/prisma';
import { verifyWebhook } from '../services/payment-service';

const router = Router();

router.post('/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;
  try {
    const payload = Buffer.from(JSON.stringify(req.body));
    const event = verifyWebhook(payload, signature);
    if (event.type === 'payment_intent.succeeded') {
      const paymentId = event.data.object.metadata?.paymentId;
      if (paymentId) {
        await prisma.payment.update({
          where: { id: Number(paymentId) },
          data: { paymentStatus: 'PAID' as any, paymentDate: new Date() },
        });
      }
    }
    res.json({ received: true });
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
