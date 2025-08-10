import express from "express";
import { body, param, query } from "express-validator";
import {
  getProperties,
  getProperty,
  createProperty,
} from "../controllers/propertyControllers";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../middleware/validationMiddleware";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get(
  "/",
  [
    query("favoriteIds").optional().isString(),
    query("priceMin").optional().isFloat().toFloat(),
    query("priceMax").optional().isFloat().toFloat(),
    query("beds").optional().isInt().toInt(),
    query("baths").optional().isFloat().toFloat(),
    query("propertyType").optional().isString(),
    query("squareFeetMin").optional().isInt().toInt(),
    query("squareFeetMax").optional().isInt().toInt(),
    query("amenities").optional().isString(),
    query("availableFrom").optional().isISO8601(),
    query("latitude").optional().isFloat().toFloat(),
    query("longitude").optional().isFloat().toFloat(),
    validate,
  ],
  getProperties
);
router.get(
  "/:id",
  [param("id").isInt().toInt(), validate],
  getProperty
);
router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"),
  [
    body("address").isString().notEmpty(),
    body("city").isString().notEmpty(),
    body("state").isString().notEmpty(),
    body("country").isString().notEmpty(),
    body("postalCode").isString().notEmpty(),
    body("managerCognitoId").isString().notEmpty(),
    body("pricePerMonth").isFloat().toFloat(),
    body("securityDeposit").isFloat().toFloat(),
    body("applicationFee").isFloat().toFloat(),
    body("beds").isInt().toInt(),
    body("baths").isFloat().toFloat(),
    body("squareFeet").isInt().toInt(),
    validate,
  ],
  createProperty
);

export default router;
