import express from "express";
import {
  getTenant,
  createTenant,
  updateTenant,
  getCurrentResidences,
  addFavoriteProperty,
  removeFavoriteProperty,
} from "../controllers/tenantControllers";

const router = express.Router();

/**
 * @openapi
 * /tenants/{cognitoId}:
 *   get:
 *     summary: Get tenant by Cognito ID
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: cognitoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tenant details
 */
router.get("/:cognitoId", getTenant);

/**
 * @openapi
 * /tenants/{cognitoId}:
 *   put:
 *     summary: Update tenant information
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: cognitoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tenant updated
 */
router.put("/:cognitoId", updateTenant);

/**
 * @openapi
 * /tenants:
 *   post:
 *     summary: Create a new tenant
 *     tags: [Tenants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tenant created
 */
router.post("/", createTenant);

/**
 * @openapi
 * /tenants/{cognitoId}/current-residences:
 *   get:
 *     summary: Get current residences for a tenant
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: cognitoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of residences
 */
router.get("/:cognitoId/current-residences", getCurrentResidences);

/**
 * @openapi
 * /tenants/{cognitoId}/favorites/{propertyId}:
 *   post:
 *     summary: Add a property to favorites
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: cognitoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property added to favorites
 */
router.post("/:cognitoId/favorites/:propertyId", addFavoriteProperty);

/**
 * @openapi
 * /tenants/{cognitoId}/favorites/{propertyId}:
 *   delete:
 *     summary: Remove a property from favorites
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: cognitoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property removed from favorites
 */
router.delete("/:cognitoId/favorites/:propertyId", removeFavoriteProperty);

export default router;
