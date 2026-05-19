import { Router } from "express";
import {
  getNearbyPlaces,
  importExternalPlace,
} from "../controllers/place.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const placeRoutes = Router();

placeRoutes.get("/nearby", asyncHandler(getNearbyPlaces));
placeRoutes.post("/import", requireAuth, asyncHandler(importExternalPlace));
