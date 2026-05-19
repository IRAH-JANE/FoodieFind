import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { calculateDistanceKm } from "../utils/distance.js";

const nearbyPlacesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(5000).default(1500),
  search: z.string().optional(),
});

function isBadPlaceName(name: string) {
  const cleaned = name.trim().toLowerCase();

  if (!cleaned) return true;
  if (cleaned === "unnamed food place") return true;
  if (cleaned.startsWith("unnamed food place")) return true;
  if (cleaned === "unknown") return true;
  if (cleaned === "restaurant") return true;
  if (cleaned === "cafe") return true;
  if (/^food place \d+$/i.test(name)) return true;

  return false;
}

const importPlaceSchema = z.object({
  externalId: z.string().min(1),
  source: z.literal("OPENSTREETMAP"),
  name: z.string().trim().min(2).refine((value) => !isBadPlaceName(value), {
    message: "Cannot save unnamed or low-quality places.",
  }),
  category: z.string().min(1),
  cuisine: z.string().nullable().optional(),
  address: z.string().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  phone: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  openingHours: z.string().nullable().optional(),
});

type PlaceResult = {
  id: string;
  externalId: string;
  source: "OPENSTREETMAP";
  name: string;
  category: string;
  cuisine: string | null;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  rawTags: Record<string, string>;
  isImported?: boolean;
  restaurantId?: string | null;
};

type GeoapifyFeature = {
  type: "Feature";
  properties: {
    place_id?: string;
    name?: string;
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    lat?: number;
    lon?: number;
    categories?: string[];
    datasource?: {
      raw?: Record<string, string>;
    };
    website?: string;
    contact?: {
      phone?: string;
      website?: string;
    };
    opening_hours?: string;
  };
  geometry?: {
    type: string;
    coordinates: [number, number];
  };
};

type GeoapifyResponse = {
  type: "FeatureCollection";
  features: GeoapifyFeature[];
};

function getCategory(categories: string[] = []) {
  if (categories.some((category) => category.includes("restaurant"))) return "Restaurant";
  if (categories.some((category) => category.includes("cafe"))) return "Cafe";
  if (categories.some((category) => category.includes("fast_food"))) return "Fast Food";
  if (categories.some((category) => category.includes("food_court"))) return "Food Court";
  if (categories.some((category) => category.includes("ice_cream"))) return "Dessert";
  if (categories.some((category) => category.includes("bar"))) return "Bar";
  if (categories.some((category) => category.includes("pub"))) return "Pub";
  if (categories.some((category) => category.includes("bakery"))) return "Bakery";

  return "Food Place";
}

function getExternalId(feature: GeoapifyFeature) {
  const raw = feature.properties.datasource?.raw ?? {};

  if (raw.osm_id && raw.osm_type) {
    return `${raw.osm_type}/${raw.osm_id}`;
  }

  return feature.properties.place_id ?? `${feature.properties.lat},${feature.properties.lon}`;
}

function dedupePlaces(places: PlaceResult[]) {
  const uniquePlaces: PlaceResult[] = [];
  const seenExternalIds = new Set<string>();

  for (const place of places) {
    if (seenExternalIds.has(place.externalId)) continue;

    const duplicateByNameAndDistance = uniquePlaces.some((existingPlace) => {
      const sameName =
        existingPlace.name.trim().toLowerCase() === place.name.trim().toLowerCase();

      if (!sameName) return false;

      const distanceBetweenPlaces = calculateDistanceKm(
        existingPlace.latitude,
        existingPlace.longitude,
        place.latitude,
        place.longitude
      );

      return distanceBetweenPlaces <= 0.08;
    });

    if (duplicateByNameAndDistance) continue;

    seenExternalIds.add(place.externalId);
    uniquePlaces.push(place);
  }

  return uniquePlaces;
}

function normalizePlaceName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function attachImportStatus(places: PlaceResult[]) {
  const importedRestaurants = await prisma.restaurant.findMany({
    where: {
      externalSource: "OPENSTREETMAP",
    },
    select: {
      id: true,
      externalId: true,
      name: true,
      latitude: true,
      longitude: true,
    },
  });

  const importedMap = new Map(
    importedRestaurants
      .filter((restaurant) => restaurant.externalId)
      .map((restaurant) => [restaurant.externalId, restaurant.id])
  );

  return places.map((place) => {
    let restaurantId = importedMap.get(place.externalId) ?? null;

    if (!restaurantId) {
      const normalizedPlaceName = normalizePlaceName(place.name);

      const matchingRestaurant = importedRestaurants.find((restaurant) => {
        const normalizedRestaurantName = normalizePlaceName(restaurant.name);

        const namesMatch =
          normalizedRestaurantName === normalizedPlaceName ||
          normalizedRestaurantName.includes(normalizedPlaceName) ||
          normalizedPlaceName.includes(normalizedRestaurantName);

        if (!namesMatch) return false;

        const distanceKm = calculateDistanceKm(
          place.latitude,
          place.longitude,
          restaurant.latitude,
          restaurant.longitude
        );

        return distanceKm <= 0.2;
      });

      restaurantId = matchingRestaurant?.id ?? null;
    }

    return {
      ...place,
      isImported: Boolean(restaurantId),
      restaurantId,
    };
  });
}

async function getImportedNearbyPlaces(
  lat: number,
  lng: number,
  radius: number,
  search?: string
) {
  const restaurants = await prisma.restaurant.findMany({
    where: {
      externalSource: "OPENSTREETMAP",
    },
  });

  const searchText = search?.trim().toLowerCase();

  return restaurants
    .filter((restaurant) => !isBadPlaceName(restaurant.name))
    .map((restaurant) => {
      const distanceKm = calculateDistanceKm(
        lat,
        lng,
        restaurant.latitude,
        restaurant.longitude
      );

      return {
        id: `db-${restaurant.id}`,
        externalId: restaurant.externalId ?? restaurant.id,
        source: "OPENSTREETMAP" as const,
        name: restaurant.name,
        category: restaurant.category,
        cuisine: null,
        address: restaurant.address,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        distanceKm,
        phone: restaurant.phone,
        website: restaurant.website,
        openingHours: restaurant.openingHours,
        rawTags: {},
        isImported: true,
        restaurantId: restaurant.id,
      };
    })
    .filter((place) => place.distanceKm <= radius / 1000)
    .filter((place) => {
      if (!searchText) return true;

      return (
        place.name.toLowerCase().includes(searchText) ||
        place.category.toLowerCase().includes(searchText) ||
        place.address.toLowerCase().includes(searchText)
      );
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 60);
}

async function fetchGeoapifyPlaces(
  lat: number,
  lng: number,
  radius: number,
  search?: string
) {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    throw new Error("GEOAPIFY_API_KEY is missing in server .env");
  }

  const url = new URL("https://api.geoapify.com/v2/places");

  url.searchParams.set(
    "categories",
    [
      "catering.restaurant",
      "catering.cafe",
      "catering.fast_food",
      "catering.food_court",
      "catering.bar",
      "catering.pub",
      "catering.ice_cream",
    ].join(",")
  );

  url.searchParams.set("filter", `circle:${lng},${lat},${radius}`);
  url.searchParams.set("bias", `proximity:${lng},${lat}`);
  url.searchParams.set("limit", "80");
  url.searchParams.set("apiKey", apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });

    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(`Geoapify returned ${response.status}: ${rawText.slice(0, 300)}`);
    }

    const data = JSON.parse(rawText) as GeoapifyResponse;
    const searchText = search?.trim().toLowerCase();

    const places = data.features
      .map((feature) => {
        const rawTags = feature.properties.datasource?.raw ?? {};
        const latitude =
          feature.properties.lat ?? feature.geometry?.coordinates?.[1];
        const longitude =
          feature.properties.lon ?? feature.geometry?.coordinates?.[0];

        if (latitude === undefined || longitude === undefined) return null;

        const name =
          feature.properties.name ||
          rawTags.name ||
          rawTags.brand ||
          "";

        if (isBadPlaceName(name)) return null;

        const category = getCategory(feature.properties.categories ?? []);
        const cuisine = rawTags.cuisine ?? null;

        const place: PlaceResult = {
          id: `geoapify-${getExternalId(feature)}`,
          externalId: getExternalId(feature),
          source: "OPENSTREETMAP",
          name,
          category,
          cuisine,
          address:
            feature.properties.formatted ||
            feature.properties.address_line2 ||
            feature.properties.address_line1 ||
            "Address not available",
          latitude,
          longitude,
          distanceKm: calculateDistanceKm(lat, lng, latitude, longitude),
          phone:
            feature.properties.contact?.phone ||
            rawTags.phone ||
            rawTags["contact:phone"] ||
            null,
          website:
            feature.properties.website ||
            feature.properties.contact?.website ||
            rawTags.website ||
            rawTags["contact:website"] ||
            null,
          openingHours:
            feature.properties.opening_hours ||
            rawTags.opening_hours ||
            null,
          rawTags,
          isImported: false,
          restaurantId: null,
        };

        return place;
      })
      .filter((place): place is PlaceResult => {
        if (!place) return false;

        if (!searchText) return true;

        return (
          place.name.toLowerCase().includes(searchText) ||
          place.category.toLowerCase().includes(searchText) ||
          String(place.cuisine ?? "").toLowerCase().includes(searchText) ||
          place.address.toLowerCase().includes(searchText)
        );
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return dedupePlaces(places).slice(0, 60);
  } finally {
    clearTimeout(timeout);
  }
}

export async function getNearbyPlaces(req: Request, res: Response) {
  const query = nearbyPlacesQuerySchema.parse(req.query);

  try {
    const places = await fetchGeoapifyPlaces(
      query.lat,
      query.lng,
      query.radius,
      query.search
    );

    const placesWithImportStatus = await attachImportStatus(places);

    res.status(200).json({
      success: true,
      provider: "GEOAPIFY",
      count: placesWithImportStatus.length,
      data: placesWithImportStatus,
    });
  } catch (error) {
    console.error("Geoapify nearby search failed:", error);

    const importedFallback = await getImportedNearbyPlaces(
      query.lat,
      query.lng,
      query.radius,
      query.search
    );

    res.status(importedFallback.length > 0 ? 200 : 502).json({
      success: importedFallback.length > 0,
      provider: "DATABASE_FALLBACK",
      count: importedFallback.length,
      message:
        importedFallback.length > 0
          ? "Geoapify failed, so FoodieFind returned already imported nearby places."
          : "Nearby search provider failed. Add GEOAPIFY_API_KEY in server .env or try again later.",
      data: importedFallback,
    });
  }
}

export async function importExternalPlace(
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

  const body = importPlaceSchema.parse(req.body);

  let restaurant = await prisma.restaurant.findFirst({
    where: {
      externalSource: body.source,
      externalId: body.externalId,
    },
  });

  let imported = false;

  if (!restaurant) {
    const possibleDuplicates = await prisma.restaurant.findMany({
      where: {
        name: {
          equals: body.name,
          mode: "insensitive",
        },
      },
    });

    restaurant =
      possibleDuplicates.find((possibleDuplicate) => {
        const distanceKm = calculateDistanceKm(
          body.latitude,
          body.longitude,
          possibleDuplicate.latitude,
          possibleDuplicate.longitude
        );

        return distanceKm <= 0.08;
      }) ?? null;
  }

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: body.name,
        description: `Real food place discovered from OpenStreetMap${
          body.cuisine ? ` with ${body.cuisine} cuisine` : ""
        }.`,
        category: body.category,
        address: body.address || "Address not available",
        latitude: body.latitude,
        longitude: body.longitude,
        priceLevel: "MODERATE",
        imageUrl: null,
        openingHours: body.openingHours || null,
        phone: body.phone || null,
        website: body.website || null,
        externalSource: body.source,
        externalId: body.externalId,
        isTrending: false,
        isHiddenGem: false,
        isAffordable: false,
        isVerified: false,
      },
    });

    imported = true;
  }

  await prisma.favorite.upsert({
    where: {
      userId_restaurantId: {
        userId: req.user.userId,
        restaurantId: restaurant.id,
      },
    },
    update: {},
    create: {
      userId: req.user.userId,
      restaurantId: restaurant.id,
    },
  });

  res.status(201).json({
    success: true,
    message: imported
      ? "Place imported and saved to favorites"
      : "Place already existed and was saved to favorites",
    data: {
      restaurantId: restaurant.id,
      restaurant,
      imported,
      favorited: true,
    },
  });
}


