import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { calculateDistanceKm } from "../utils/distance.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

const restaurantQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  priceLevel: z.enum(["CHEAP", "MODERATE", "EXPENSIVE"]).optional(),
  tag: z.enum(["trending", "hidden", "affordable", "verified"]).optional(),
  sort: z.enum(["newest", "rating", "nearest"]).optional(),
  source: z.enum(["all", "real", "manual"]).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  maxDistanceKm: z.coerce.number().positive().optional(),
});

const restaurantBodySchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().min(10),
  category: z.string().trim().min(2),
  address: z.string().trim().min(3),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  priceLevel: z.enum(["CHEAP", "MODERATE", "EXPENSIVE"]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  openingHours: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  isTrending: z.boolean().optional(),
  isHiddenGem: z.boolean().optional(),
  isAffordable: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

function formatRestaurant(restaurant: any, lat?: number, lng?: number) {
  const totalRating = restaurant.reviews.reduce(
    (sum: number, review: any) => sum + review.rating,
    0
  );

  const averageRating =
    restaurant.reviews.length > 0
      ? Number((totalRating / restaurant.reviews.length).toFixed(1))
      : 0;

  const distanceKm =
    lat !== undefined && lng !== undefined
      ? calculateDistanceKm(lat, lng, restaurant.latitude, restaurant.longitude)
      : null;

  return {
    ...restaurant,
    averageRating,
    reviewCount: restaurant._count.reviews,
    favoriteCount: restaurant._count.favorites,
    distanceKm,
  };
}

export async function getRestaurants(req: Request, res: Response) {
  const query = restaurantQuerySchema.parse(req.query);

  const restaurants = await prisma.restaurant.findMany({
    where: {
      AND: [
        query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: "insensitive" } },
                { description: { contains: query.search, mode: "insensitive" } },
                { category: { contains: query.search, mode: "insensitive" } },
                { address: { contains: query.search, mode: "insensitive" } },
              ],
            }
          : {},
        query.category
          ? {
              category: {
                equals: query.category,
                mode: "insensitive",
              },
            }
          : {},
        query.priceLevel ? { priceLevel: query.priceLevel } : {},
        query.tag === "trending" ? { isTrending: true } : {},
        query.tag === "hidden" ? { isHiddenGem: true } : {},
        query.tag === "affordable" ? { isAffordable: true } : {},
        query.tag === "verified" ? { isVerified: true } : {},
        query.source === "real" ? { externalSource: { not: null } } : {},
        query.source === "manual" ? { externalSource: null } : {},
      ],
    },
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
    orderBy: {
      createdAt: "desc",
    },
  });

  let restaurantsWithStats = restaurants.map((restaurant) =>
    formatRestaurant(restaurant, query.lat, query.lng)
  );

  if (
    query.maxDistanceKm !== undefined &&
    query.lat !== undefined &&
    query.lng !== undefined
  ) {
    restaurantsWithStats = restaurantsWithStats.filter((restaurant) => {
      return (
        restaurant.distanceKm !== null &&
        restaurant.distanceKm <= query.maxDistanceKm!
      );
    });
  }

  if (query.sort === "rating") {
    restaurantsWithStats.sort((a, b) => b.averageRating - a.averageRating);
  }

  if (query.sort === "nearest") {
    restaurantsWithStats.sort((a, b) => {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }

  res.status(200).json({
    success: true,
    count: restaurantsWithStats.length,
    data: restaurantsWithStats,
  });
}

export async function getRestaurantById(req: Request, res: Response) {
  const { id } = req.params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
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
  });

  if (!restaurant) {
    res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: formatRestaurant(restaurant),
  });
}

export async function createRestaurant(req: AuthenticatedRequest, res: Response) {
  const body = restaurantBodySchema.parse(req.body);

  const restaurant = await prisma.restaurant.create({
    data: {
      name: body.name,
      description: body.description,
      category: body.category,
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      priceLevel: body.priceLevel,
      imageUrl: body.imageUrl || null,
      openingHours: body.openingHours || null,
      phone: body.phone || null,
      website: body.website || null,
      isTrending: body.isTrending ?? false,
      isHiddenGem: body.isHiddenGem ?? false,
      isAffordable: body.isAffordable ?? false,
      isVerified: body.isVerified ?? false,
    },
  });

  res.status(201).json({
    success: true,
    message: "Restaurant created successfully",
    data: restaurant,
  });
}

export async function updateRestaurant(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const body = restaurantBodySchema.parse(req.body);

  const existingRestaurant = await prisma.restaurant.findUnique({
    where: { id },
  });

  if (!existingRestaurant) {
    res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
    return;
  }

  const updatedRestaurant = await prisma.restaurant.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      category: body.category,
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      priceLevel: body.priceLevel,
      imageUrl: body.imageUrl || null,
      openingHours: body.openingHours || null,
      phone: body.phone || null,
      website: body.website || null,
      isTrending: body.isTrending ?? false,
      isHiddenGem: body.isHiddenGem ?? false,
      isAffordable: body.isAffordable ?? false,
      isVerified: body.isVerified ?? false,
    },
  });

  res.status(200).json({
    success: true,
    message: "Restaurant updated successfully",
    data: updatedRestaurant,
  });
}

export async function deleteRestaurant(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
  });

  if (!restaurant) {
    res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
    return;
  }

  await prisma.restaurant.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: "Restaurant deleted successfully",
  });
}
