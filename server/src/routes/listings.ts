import express from "express";
import {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listings";
import { validateBody } from "../middleware/validationMiddleware";
import { listingSchema } from "../validation/listingSchema";

const router = express.Router();

router.get("/", getListings);
router.get("/:id", getListing);
router.post("/", validateBody(listingSchema), createListing);
router.put("/:id", validateBody(listingSchema), updateListing);
router.delete("/:id", deleteListing);

export default router;
