import type { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3).max(1000),
});

export async function getAllReviews(req: AuthenticatedRequest, res: Response) {
  const reviews = await prisma.review.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      restaurant: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
}

export async function createRestaurantReview(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const { restaurantId } = req.params;
  const body = reviewSchema.parse(req.body);

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

  const review = await prisma.review.upsert({
    where: {
      userId_restaurantId: {
        userId: req.user.userId,
        restaurantId,
      },
    },
    update: {
      rating: body.rating,
      comment: body.comment,
    },
    create: {
      userId: req.user.userId,
      restaurantId,
      rating: body.rating,
      comment: body.comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: "Review saved successfully",
    data: review,
  });
}

export async function updateReview(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const { reviewId } = req.params;
  const body = reviewSchema.parse(req.body);

  const existingReview = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!existingReview) {
    res.status(404).json({
      success: false,
      message: "Review not found",
    });
    return;
  }

  if (existingReview.userId !== req.user.userId && req.user.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      message: "You can only edit your own review",
    });
    return;
  }

  const updatedReview = await prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      rating: body.rating,
      comment: body.comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    data: updatedReview,
  });
}

export async function deleteReview(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const { reviewId } = req.params;

  const existingReview = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!existingReview) {
    res.status(404).json({
      success: false,
      message: "Review not found",
    });
    return;
  }

  if (existingReview.userId !== req.user.userId && req.user.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      message: "You can only delete your own review",
    });
    return;
  }

  await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
}

export async function getMyReviews(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const reviews = await prisma.review.findMany({
    where: {
      userId: req.user.userId,
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          category: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
}
