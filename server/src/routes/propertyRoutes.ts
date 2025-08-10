import express from "express";
import {
  getProperties,
  getProperty,
  createProperty,
} from "../controllers/propertyControllers";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateBody, validateQuery } from "../middleware/validationMiddleware";
import {
  propertyCreateSchema,
  propertyQuerySchema,
} from "../validation/propertySchema";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", validateQuery(propertyQuerySchema), getProperties);
router.get("/:id", getProperty);
router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"),
  validateBody(propertyCreateSchema),
  createProperty
);

export default router;
