import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, registerUser } from "../services/authApi";
import type { User } from "../types/user";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "foodiefind_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token]);

  async function login(email: string, password: string) {
    const data = await loginUser(email, password);

    localStorage.setItem(TOKEN_KEY, data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
  }

  async function register(name: string, email: string, password: string) {
    const data = await registerUser(name, email, password);

    localStorage.setItem(TOKEN_KEY, data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
