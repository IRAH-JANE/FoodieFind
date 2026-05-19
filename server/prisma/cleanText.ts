import "dotenv/config";
import { prisma } from "../src/config/prisma.js";

async function main() {
  await prisma.restaurant.updateMany({
    where: {
      name: "Cafe Luna",
    },
    data: {
      description: "A cozy hidden cafe known for iced coffee, pastries, and quiet study corners.",
      category: "Cafe",
    },
  });

  await prisma.restaurant.updateMany({
    where: {
      name: "Sweet Crumbs",
    },
    data: {
      description: "Dessert cafe serving cakes, cookies, milk tea, and late-night sweets.",
    },
  });

  console.log("Restaurant text cleaned successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
