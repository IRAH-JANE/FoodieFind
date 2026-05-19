import type { Response } from "express";
import { prisma } from "../config/prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

function formatRestaurant(restaurant: any) {
  const totalRating = restaurant.reviews.reduce(
    (sum: number, review: any) => sum + review.rating,
    0
  );

  const averageRating =
    restaurant.reviews.length > 0
      ? Number((totalRating / restaurant.reviews.length).toFixed(1))
      : 0;

  return {
    ...restaurant,
    averageRating,
    reviewCount: restaurant._count.reviews,
    favoriteCount: restaurant._count.favorites,
    distanceKm: null,
  };
}

export async function getMyFavorites(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const favorites = await prisma.favorite.findMany({
    where: {
      userId: req.user.userId,
    },
    include: {
      restaurant: {
        include: {
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const restaurants = favorites.map((favorite) =>
    formatRestaurant(favorite.restaurant)
  );

  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants,
  });
}

export async function saveFavorite(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const { restaurantId } = req.params;

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
  });

  if (!restaurant) {
    res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
    return;
  }

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_restaurantId: {
        userId: req.user.userId,
        restaurantId,
      },
    },
    update: {},
    create: {
      userId: req.user.userId,
      restaurantId,
    },
  });

  res.status(201).json({
    success: true,
    message: "Restaurant saved to favorites",
    data: favorite,
  });
}

export async function removeFavorite(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const { restaurantId } = req.params;

  await prisma.favorite.deleteMany({
    where: {
      userId: req.user.userId,
      restaurantId,
    },
  });

  res.status(200).json({
    success: true,
    message: "Restaurant removed from favorites",
  });
}
