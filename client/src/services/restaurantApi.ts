import axios from "axios";
import type { PriceLevel, Restaurant } from "../types/restaurant";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export type RestaurantFilters = {
  search?: string;
  category?: string;
  priceLevel?: string;
  tag?: string;
  sort?: string;
  source?: "all" | "real" | "manual";
  lat?: number;
  lng?: number;
  maxDistanceKm?: number;
};

export type RestaurantFormData = {
  name: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  priceLevel: PriceLevel;
  imageUrl?: string;
  openingHours?: string;
  phone?: string;
  website?: string;
  isTrending?: boolean;
  isHiddenGem?: boolean;
  isAffordable?: boolean;
  isVerified?: boolean;
};

export async function getRestaurants(filters: RestaurantFilters = {}) {
  const response = await axios.get<{
    success: boolean;
    count: number;
    data: Restaurant[];
  }>(`${API_URL}/restaurants`, {
    params: filters,
  });

  return response.data.data;
}

export async function getRestaurantById(id: string) {
  const response = await axios.get<{
    success: boolean;
    data: Restaurant;
  }>(`${API_URL}/restaurants/${id}`);

  return response.data.data;
}

export async function createRestaurant(data: RestaurantFormData, token: string) {
  const response = await axios.post(`${API_URL}/restaurants`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateRestaurant(
  id: string,
  data: RestaurantFormData,
  token: string
) {
  const response = await axios.patch(`${API_URL}/restaurants/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function deleteRestaurant(id: string, token: string) {
  const response = await axios.delete(`${API_URL}/restaurants/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
