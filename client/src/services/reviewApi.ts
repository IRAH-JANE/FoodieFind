import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export type AdminReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  restaurant: {
    id: string;
    name: string;
    category: string;
  };
};

export type UserReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  restaurant: {
    id: string;
    name: string;
    category: string;
    imageUrl: string | null;
  };
};

export async function createRestaurantReview(
  restaurantId: string,
  rating: number,
  comment: string,
  token: string
) {
  const response = await axios.post(
    `${API_URL}/restaurants/${restaurantId}/reviews`,
    {
      rating,
      comment,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getAllReviews(token: string) {
  const response = await axios.get<{
    success: boolean;
    count: number;
    data: AdminReview[];
  }>(`${API_URL}/reviews`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function getMyReviews(token: string) {
  const response = await axios.get<{
    success: boolean;
    count: number;
    data: UserReview[];
  }>(`${API_URL}/reviews/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function deleteReview(reviewId: string, token: string) {
  const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
