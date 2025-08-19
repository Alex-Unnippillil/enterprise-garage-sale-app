import { Request, Response, NextFunction } from 'express';
import { createCharge, getPaymentHistory, handleWebhook } from '../services/payment-service';

export const chargePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, leaseId } = req.body;
    if (!amount || !leaseId) {
      res.status(400).json({ message: 'Missing amount or leaseId' });
      return;
    }
    const tenantId = req.user?.id || '';
    const clientSecret = await createCharge(tenantId, Number(leaseId), Number(amount));
    res.json({ clientSecret });
  } catch (err) {
    next(err);
  }
};

export const paymentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user?.id || '';
    const payments = await getPaymentHistory(tenantId);
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await handleWebhook(req.body);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};
