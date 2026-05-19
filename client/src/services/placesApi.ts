import axios from "axios";
import type { ExternalPlace } from "../types/place";
import type { Restaurant } from "../types/restaurant";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export type NearbyPlacesFilters = {
  lat: number;
  lng: number;
  radius?: number;
  search?: string;
};

export type ImportPlaceResponse = {
  restaurantId: string;
  restaurant: Restaurant;
  imported: boolean;
  favorited: boolean;
};

export async function getNearbyPlaces(filters: NearbyPlacesFilters) {
  const response = await axios.get<{
    success: boolean;
    count: number;
    data: ExternalPlace[];
  }>(`${API_URL}/places/nearby`, {
    params: filters,
  });

  return response.data.data;
}

export async function importExternalPlace(place: ExternalPlace, token: string) {
  const response = await axios.post<{
    success: boolean;
    message: string;
    data: ImportPlaceResponse;
  }>(
    `${API_URL}/places/import`,
    {
      externalId: place.externalId,
      source: place.source,
      name: place.name,
      category: place.category,
      cuisine: place.cuisine,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      phone: place.phone,
      website: place.website,
      openingHours: place.openingHours,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
}
