import express from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { getLeasePayments, getLeases } from "../controllers/lease-controllers";

const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), getLeases);
router.get(
  "/:id/payments",
  authMiddleware(["manager", "tenant"]),
  getLeasePayments
);

export default router;
