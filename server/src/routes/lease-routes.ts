import express from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import {
  getLeasePayments,
  getLeases,
  createPayment,
  updatePayment,
} from "../controllers/lease-controllers";

const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), getLeases);
router.get(
  "/:id/payments",
  authMiddleware(["manager", "tenant"]),
  getLeasePayments
);
router.post(
  "/:id/payments",
  authMiddleware(["manager"]),
  createPayment
);
router.put(
  "/payments/:paymentId",
  authMiddleware(["manager"]),
  updatePayment
);

router.post(
  "/:id/payments",
  authMiddleware(["manager"]),
  createPayment
);

router.put(
  "/payments/:paymentId",
  authMiddleware(["manager"]),
  updatePayment
);

export default router;
