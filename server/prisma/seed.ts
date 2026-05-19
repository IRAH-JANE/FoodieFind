import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/config/prisma.js";

async function main() {
  console.log("Seeding FoodieFind database...");

  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.restaurant.deleteMany();

  const adminPassword = await bcrypt.hash("admin12345", 12);
  const userPassword = await bcrypt.hash("user12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@foodiefind.com" },
    update: {},
    create: {
      name: "FoodieFind Admin",
      email: "admin@foodiefind.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "user@foodiefind.com" },
    update: {},
    create: {
      name: "Demo Foodie",
      email: "user@foodiefind.com",
      password: userPassword,
      role: "USER",
    },
  });

  const restaurants = [
    {
      name: "Cafe Luna",
      description: "A cozy hidden café known for iced coffee, pastries, and quiet study corners.",
      category: "Cafe",
      address: "123 Luna Street, Manila",
      latitude: 14.5995,
      longitude: 120.9842,
      priceLevel: "MODERATE" as const,
      imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
      openingHours: "8:00 AM - 10:00 PM",
      phone: "0917-111-2222",
      isTrending: false,
      isHiddenGem: true,
      isAffordable: true,
    },
    {
      name: "Budget Bites",
      description: "Student-friendly meals with large servings and affordable rice bowls.",
      category: "Budget Meal",
      address: "45 University Avenue, Manila",
      latitude: 14.6042,
      longitude: 120.9822,
      priceLevel: "CHEAP" as const,
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      openingHours: "9:00 AM - 9:00 PM",
      phone: "0917-333-4444",
      isTrending: true,
      isHiddenGem: false,
      isAffordable: true,
    },
    {
      name: "Ramen District",
      description: "Popular ramen shop serving rich broth, gyoza, and Japanese rice meals.",
      category: "Japanese",
      address: "88 Noodle Lane, Quezon City",
      latitude: 14.6507,
      longitude: 121.0494,
      priceLevel: "MODERATE" as const,
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
      openingHours: "11:00 AM - 11:00 PM",
      phone: "0917-555-6666",
      isTrending: true,
      isHiddenGem: false,
      isAffordable: false,
    },
    {
      name: "Seoul Spoon",
      description: "Korean comfort food spot with bibimbap, tteokbokki, and budget lunch sets.",
      category: "Korean",
      address: "12 K-Food Street, Makati",
      latitude: 14.5547,
      longitude: 121.0244,
      priceLevel: "MODERATE" as const,
      imageUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9",
      openingHours: "10:00 AM - 10:00 PM",
      phone: "0917-777-8888",
      isTrending: true,
      isHiddenGem: false,
      isAffordable: true,
    },
    {
      name: "Sweet Crumbs",
      description: "Dessert café serving cakes, cookies, milk tea, and late-night sweets.",
      category: "Dessert",
      address: "77 Sugar Road, Manila",
      latitude: 14.5908,
      longitude: 120.9785,
      priceLevel: "CHEAP" as const,
      imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777",
      openingHours: "12:00 PM - 12:00 AM",
      phone: "0917-999-0000",
      isTrending: false,
      isHiddenGem: true,
      isAffordable: true,
    },
  ];

  const createdRestaurants = [];

  for (const restaurant of restaurants) {
    const created = await prisma.restaurant.create({
      data: restaurant,
    });

    createdRestaurants.push(created);
  }

  await prisma.review.createMany({
    data: [
      {
        userId: demoUser.id,
        restaurantId: createdRestaurants[0].id,
        rating: 5,
        comment: "Very cozy place. Great coffee and perfect for studying.",
      },
      {
        userId: admin.id,
        restaurantId: createdRestaurants[1].id,
        rating: 5,
        comment: "Affordable meals with big servings. Good for students.",
      },
      {
        userId: demoUser.id,
        restaurantId: createdRestaurants[2].id,
        rating: 4,
        comment: "The ramen broth is rich and the place feels trendy.",
      },
      {
        userId: admin.id,
        restaurantId: createdRestaurants[3].id,
        rating: 4,
        comment: "Good Korean lunch sets and reasonable prices.",
      },
      {
        userId: demoUser.id,
        restaurantId: createdRestaurants[4].id,
        rating: 5,
        comment: "A hidden dessert spot. Their cakes are worth trying.",
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Admin login: admin@foodiefind.com / admin12345");
  console.log("User login: user@foodiefind.com / user12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
