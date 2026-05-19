import { Router } from "express";
import {
  deleteReview,
  getAllReviews,
  getMyReviews,
  updateReview,
} from "../controllers/review.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reviewRoutes = Router();

reviewRoutes.get("/", requireAuth, requireAdmin, asyncHandler(getAllReviews));
reviewRoutes.get("/me", requireAuth, asyncHandler(getMyReviews));
reviewRoutes.patch("/:reviewId", requireAuth, asyncHandler(updateReview));
reviewRoutes.delete("/:reviewId", requireAuth, asyncHandler(deleteReview));
