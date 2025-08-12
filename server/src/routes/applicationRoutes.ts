import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createApplication,
  listApplications,
  updateApplicationStatus,
} from "../controllers/applicationControllers";

const router = express.Router();

/**
 * @openapi
 * /applications:
 *   post:
 *     summary: Submit a new application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Application created
 */
router.post("/", authMiddleware(["tenant"]), createApplication);

/**
 * @openapi
 * /applications/{id}/status:
 *   put:
 *     summary: Update application status
 *     tags: [Applications]
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
 *         description: Status updated
 */
router.put("/:id/status", authMiddleware(["manager"]), updateApplicationStatus);

/**
 * @openapi
 * /applications:
 *   get:
 *     summary: List applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications
 */
router.get("/", authMiddleware(["manager", "tenant"]), listApplications);

export default router;
