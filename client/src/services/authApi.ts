import axios from "axios";
import type { User } from "../types/user";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export async function loginUser(email: string, password: string) {
  const response = await axios.post<{
    success: boolean;
    message: string;
    data: AuthResponse;
  }>(`${API_URL}/auth/login`, {
    email,
    password,
  });

  return response.data.data;
}

export async function registerUser(name: string, email: string, password: string) {
  const response = await axios.post<{
    success: boolean;
    message: string;
    data: AuthResponse;
  }>(`${API_URL}/auth/register`, {
    name,
    email,
    password,
  });

  return response.data.data;
}

export async function getCurrentUser(token: string) {
  const response = await axios.get<{
    success: boolean;
    data: {
      user: User;
    };
  }>(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data.user;
}
