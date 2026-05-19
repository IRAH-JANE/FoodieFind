import { Router } from "express";
import {
  deleteAdminRestaurant,
  updateAdminRestaurant,
} from "../controllers/admin.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.patch("/restaurants/:id", requireAuth, requireAdmin, updateAdminRestaurant);
router.delete("/restaurants/:id", requireAuth, requireAdmin, deleteAdminRestaurant);

export default router;
