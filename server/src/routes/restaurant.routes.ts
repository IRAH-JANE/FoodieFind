import { Router } from "express";
import {
  createRestaurant,
  deleteRestaurant,
  getRestaurantById,
  getRestaurants,
  updateRestaurant,
} from "../controllers/restaurant.controller.js";
import { createRestaurantReview } from "../controllers/review.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const restaurantRoutes = Router();

restaurantRoutes.get("/", asyncHandler(getRestaurants));
restaurantRoutes.post("/", requireAuth, requireAdmin, asyncHandler(createRestaurant));

restaurantRoutes.get("/:id", asyncHandler(getRestaurantById));
restaurantRoutes.patch("/:id", requireAuth, requireAdmin, asyncHandler(updateRestaurant));
restaurantRoutes.delete("/:id", requireAuth, requireAdmin, asyncHandler(deleteRestaurant));

restaurantRoutes.post(
  "/:restaurantId/reviews",
  requireAuth,
  asyncHandler(createRestaurantReview)
);
