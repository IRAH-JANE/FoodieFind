import axios from "axios";
import type { Restaurant } from "../types/restaurant";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export async function getMyFavorites(token: string) {
  const response = await axios.get<{
    success: boolean;
    count: number;
    data: Restaurant[];
  }>(`${API_URL}/favorites/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function saveFavorite(restaurantId: string, token: string) {
  const response = await axios.post(
    `${API_URL}/favorites/${restaurantId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function removeFavorite(restaurantId: string, token: string) {
  const response = await axios.delete(`${API_URL}/favorites/${restaurantId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
