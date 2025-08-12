import express from "express";
import {
  getManager,
  createManager,
  updateManager,
  getManagerProperties,
} from "../controllers/managerControllers";

const router = express.Router();

/**
 * @openapi
 * /managers/{cognitoId}:
 *   get:
 *     summary: Get manager by Cognito ID
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: cognitoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Manager details
 */
router.get("/:cognitoId", getManager);

/**
 * @openapi
 * /managers/{cognitoId}:
 *   put:
 *     summary: Update manager information
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: cognitoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Manager updated
 */
router.put("/:cognitoId", updateManager);

/**
 * @openapi
 * /managers/{cognitoId}/properties:
 *   get:
 *     summary: List properties managed by a manager
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: cognitoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get("/:cognitoId/properties", getManagerProperties);

/**
 * @openapi
 * /managers:
 *   post:
 *     summary: Create a new manager
 *     tags: [Managers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Manager created
 */
router.post("/", createManager);

export default router;
