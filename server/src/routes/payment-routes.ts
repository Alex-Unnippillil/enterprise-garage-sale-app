import { Router } from 'express';
import { chargePayment, paymentHistory, stripeWebhook } from '../controllers/payment-controllers';
import { authMiddleware } from '../middleware/auth-middleware';

const router = Router();

router.post('/charge', authMiddleware(['tenant']), chargePayment);
router.get('/history', authMiddleware(['tenant']), paymentHistory);
router.post('/webhook', stripeWebhook);

export default router;
