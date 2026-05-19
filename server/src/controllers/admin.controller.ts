import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export async function updateAdminRestaurant(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const {
      name,
      category,
      description,
      address,
      phone,
      openingHours,
      imageUrl,
    } = req.body;

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name,
        category,
        description,
        address,
        phone,
        openingHours,
        imageUrl,
      },
    });

    return res.json({
      success: true,
      message: "Restaurant updated successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error("Admin update restaurant failed:", error);

    return res.status(500).json({
      success: false,
      message: "Could not update restaurant",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function deleteAdminRestaurant(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      await tx.favorite.deleteMany({
        where: { restaurantId: id },
      });

      await tx.review.deleteMany({
        where: { restaurantId: id },
      });

      await tx.restaurant.delete({
        where: { id },
      });
    });

    return res.json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete restaurant failed:", error);

    return res.status(500).json({
      success: false,
      message: "Could not delete restaurant",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
