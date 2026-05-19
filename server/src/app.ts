import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
import { authRoutes } from "./routes/auth.routes.js";
import { favoriteRoutes } from "./routes/favorite.routes.js";
import { placeRoutes } from "./routes/place.routes.js";
import { restaurantRoutes } from "./routes/restaurant.routes.js";
import { reviewRoutes } from "./routes/review.routes.js";

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodieFind API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/places", placeRoutes);

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);

    if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err.flatten().fieldErrors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);
