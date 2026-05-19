export type ExternalPlace = {
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
