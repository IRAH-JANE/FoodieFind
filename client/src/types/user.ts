export type UserRole = "USER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};
