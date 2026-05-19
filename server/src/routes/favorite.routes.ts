import { Router } from "express";
import {
  getMyFavorites,
  removeFavorite,
  saveFavorite,
} from "../controllers/favorite.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const favoriteRoutes = Router();

favoriteRoutes.get("/me", requireAuth, asyncHandler(getMyFavorites));
favoriteRoutes.post("/:restaurantId", requireAuth, asyncHandler(saveFavorite));
favoriteRoutes.delete("/:restaurantId", requireAuth, asyncHandler(removeFavorite));
