import express from "express";
import {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listings";

const router = express.Router();

router.get("/", getListings);
router.get("/:id", getListing);
router.post("/", createListing);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);

export default router;
