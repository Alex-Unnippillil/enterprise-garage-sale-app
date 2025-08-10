import express from "express";
import { param } from "express-validator";
import { authMiddleware } from "../middleware/authMiddleware";
import { getLeasePayments, getLeases } from "../controllers/leaseControllers";
import { validate } from "../middleware/validationMiddleware";

const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), getLeases);
router.get(
  "/:id/payments",
  authMiddleware(["manager", "tenant"]),
  [param("id").isInt().toInt(), validate],
  getLeasePayments
);

export default router;
