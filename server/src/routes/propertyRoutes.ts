import express from "express";
import {
  getProperties,
  getProperty,
  createProperty,
} from "../controllers/propertyControllers";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

/**
 * @openapi
 * /properties:
 *   get:
 *     summary: List available properties
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get("/", getProperties);

/**
 * @openapi
 * /properties/{id}:
 *   get:
 *     summary: Get a property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property details
 */
router.get("/:id", getProperty);

/**
 * @openapi
 * /properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Property created
 */
router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"),
  createProperty
);

export default router;
