import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getLeasePayments, getLeases } from "../controllers/leaseControllers";

const router = express.Router();

/**
 * @openapi
 * /leases:
 *   get:
 *     summary: List leases
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leases
 */
router.get("/", authMiddleware(["manager", "tenant"]), getLeases);

/**
 * @openapi
 * /leases/{id}/payments:
 *   get:
 *     summary: Get lease payments
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment list
 */
router.get(
  "/:id/payments",
  authMiddleware(["manager", "tenant"]),
  getLeasePayments
);

export default router;
