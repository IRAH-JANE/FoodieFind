export type PriceLevel = "CHEAP" | "MODERATE" | "EXPENSIVE";

export type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
};

export type Restaurant = {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  priceLevel: PriceLevel;
  imageUrl: string | null;
  openingHours: string | null;
  phone: string | null;
  website: string | null;
  externalSource: string | null;
  externalId: string | null;
  isTrending: boolean;
  isHiddenGem: boolean;
  isAffordable: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  favoriteCount: number;
  distanceKm: number | null;
};
