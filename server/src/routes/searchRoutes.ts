import express from "express";
import {
  searchProperties,
  searchByLocation,
  searchByPrice,
  searchByAmenities,
  searchByAvailability,
  getSearchSuggestions,
  getPopularSearches,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch
} from "../controllers/searchControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Public search routes
router.get("/properties", searchProperties);
router.get("/location", searchByLocation);
router.get("/price", searchByPrice);
router.get("/amenities", searchByAmenities);
router.get("/availability", searchByAvailability);
router.get("/suggestions", getSearchSuggestions);
router.get("/popular", getPopularSearches);

// Protected routes for saved searches
router.get("/saved", authMiddleware(["tenant", "manager"]), getSavedSearches);
router.post("/saved", authMiddleware(["tenant", "manager"]), saveSearch);
router.delete("/saved/:id", authMiddleware(["tenant", "manager"]), deleteSavedSearch);

export default router; 