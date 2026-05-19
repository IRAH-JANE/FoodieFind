import { prisma } from "../src/config/prisma.js";

const badRestaurants = await prisma.restaurant.findMany({
  where: {
    OR: [
      { name: { startsWith: "Unnamed food place", mode: "insensitive" } },
      { name: { equals: "Unknown", mode: "insensitive" } },
      { name: { equals: "Restaurant", mode: "insensitive" } },
      { name: { equals: "Cafe", mode: "insensitive" } },
    ],
  },
  select: {
    id: true,
    name: true,
  },
});

console.log("Bad restaurants found:", badRestaurants);

const result = await prisma.restaurant.deleteMany({
  where: {
    id: {
      in: badRestaurants.map((restaurant) => restaurant.id),
    },
  },
});

console.log(`Deleted ${result.count} bad restaurant(s).`);

await prisma.$disconnect();
