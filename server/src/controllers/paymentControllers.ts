import { Request, Response } from "express";
import { PrismaClient, PaymentStatus, PaymentMethod } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export const createPaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount, leaseId, description } = req.body;
    const userId = req.user?.id;

    if (!amount || !leaseId) {
      res.status(400).json({ message: "Amount and leaseId are required" });
      return;
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        leaseId,
        userId,
        description: description || "Rent payment",
      },
    });

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        amountDue: amount,
        amountPaid: 0,
        dueDate: new Date(),
        paymentStatus: PaymentStatus.Pending,
        paymentMethod: PaymentMethod.Stripe,
        stripePaymentId: paymentIntent.id,
        leaseId: parseInt(leaseId),
        description: description || "Rent payment",
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    });
  } catch (error: any) {
    console.error("Payment intent creation error:", error);
    res.status(500).json({ message: "Failed to create payment intent" });
  }
};

export const processPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { paymentIntentId, paymentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Update payment record
      const payment = await prisma.payment.update({
        where: { id: parseInt(paymentId) },
        data: {
          amountPaid: paymentIntent.amount / 100,
          paymentDate: new Date(),
          paymentStatus: PaymentStatus.Paid,
        },
      });

      // Create notification for successful payment
      await prisma.notification.create({
        data: {
          title: "Payment Successful",
          message: `Your payment of $${payment.amountPaid} has been processed successfully.`,
          type: "Payment",
          userId: req.user?.id || "",
          userType: "tenant",
          actionUrl: `/payments/history`,
        },
      });

      res.json({ success: true, payment });
    } else {
      res.status(400).json({ message: "Payment failed" });
    }
  } catch (error: any) {
    console.error("Payment processing error:", error);
    res.status(500).json({ message: "Failed to process payment" });
  }
};

export const getPaymentHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const payments = await prisma.payment.findMany({
      where: {
        lease: {
          tenantCognitoId: userId,
        },
      },
      include: {
        lease: {
          include: {
            property: {
              include: {
                location: true,
              },
            },
          },
        },
      },
      orderBy: { paymentDate: "desc" },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.payment.count({
      where: {
        lease: {
          tenantCognitoId: userId,
        },
      },
    });

    res.json({
      payments,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    console.error("Payment history error:", error);
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
};

export const getUpcomingPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const upcomingPayments = await prisma.payment.findMany({
      where: {
        lease: {
          tenantCognitoId: userId,
        },
        dueDate: {
          gte: today,
          lte: thirtyDaysFromNow,
        },
        paymentStatus: {
          in: [PaymentStatus.Pending, PaymentStatus.Overdue],
        },
      },
      include: {
        lease: {
          include: {
            property: {
              include: {
                location: true,
              },
            },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    res.json(upcomingPayments);
  } catch (error: any) {
    console.error("Upcoming payments error:", error);
    res.status(500).json({ message: "Failed to fetch upcoming payments" });
  }
};

export const refundPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(paymentId) },
      include: {
        lease: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!payment || !payment.stripePaymentId) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentId,
      reason: reason || "requested_by_customer",
    });

    // Update payment record
    await prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        paymentStatus: PaymentStatus.Refunded,
      },
    });

    // Create notification for refund
    await prisma.notification.create({
      data: {
        title: "Payment Refunded",
        message: `Your payment of $${payment.amountPaid} has been refunded.`,
        type: "Payment",
        userId: payment.lease.tenantCognitoId,
        userType: "tenant",
        actionUrl: `/payments/history`,
      },
    });

    res.json({ success: true, refund });
  } catch (error: any) {
    console.error("Refund error:", error);
    res.status(500).json({ message: "Failed to process refund" });
  }
};

export const updatePaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const { status, lateFee } = req.body;

    const payment = await prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        paymentStatus: status,
        lateFee: lateFee || 0,
      },
    });

    res.json(payment);
  } catch (error: any) {
    console.error("Payment status update error:", error);
    res.status(500).json({ message: "Failed to update payment status" });
  }
}; 