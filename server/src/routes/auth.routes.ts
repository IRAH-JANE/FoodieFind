import { Router } from "express";
import { getMe, login, register } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(register));
authRoutes.post("/login", asyncHandler(login));
authRoutes.get("/me", requireAuth, asyncHandler(getMe));
