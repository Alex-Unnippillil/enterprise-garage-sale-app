import express from "express";
import {
  createPaymentIntent,
  processPayment,
  getPaymentHistory,
  getUpcomingPayments,
  refundPayment,
  updatePaymentStatus,
} from "../controllers/paymentControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Payment routes
router.post("/create-intent", authMiddleware(["tenant", "manager"]), createPaymentIntent);
router.post("/process", authMiddleware(["tenant", "manager"]), processPayment);
router.get("/history", authMiddleware(["tenant", "manager"]), getPaymentHistory);
router.get("/upcoming", authMiddleware(["tenant", "manager"]), getUpcomingPayments);
router.post("/refund/:paymentId", authMiddleware(["manager"]), refundPayment);
router.put("/status/:paymentId", authMiddleware(["manager"]), updatePaymentStatus);

export default router; 