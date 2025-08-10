import express from "express";
import { body, param } from "express-validator";
import {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listings";
import { validate } from "../middleware/validationMiddleware";

const router = express.Router();

router.get("/", getListings);
router.get(
  "/:id",
  [param("id").isInt().toInt(), validate],
  getListing
);
router.post(
  "/",
  [
    body("title").isString().notEmpty(),
    body("description").isString().notEmpty(),
    body("price").isFloat({ gt: 0 }).toFloat(),
    validate,
  ],
  createListing
);
router.put(
  "/:id",
  [
    param("id").isInt().toInt(),
    body("title").isString().notEmpty(),
    body("description").isString().notEmpty(),
    body("price").isFloat({ gt: 0 }).toFloat(),
    validate,
  ],
  updateListing
);
router.delete(
  "/:id",
  [param("id").isInt().toInt(), validate],
  deleteListing
);

export default router;
