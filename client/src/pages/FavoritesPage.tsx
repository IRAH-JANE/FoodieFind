import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { RestaurantCard } from "../components/RestaurantCard";
import { useAuth } from "../context/AuthContext";
import { getMyFavorites } from "../services/favoriteApi";
import type { Restaurant } from "../types/restaurant";
import { AppNavbar } from "../components/AppNavbar";

export function FavoritesPage() {
  const { user, token } = useAuth();

  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFavorites() {
    if (!token) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const data = await getMyFavorites(token);
      setFavorites(data);
    } catch (error) {
      console.error(error);
      setError("Could not load favorites.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFavoriteChange(restaurantId: string, isFavorite: boolean) {
    if (!isFavorite) {
      setFavorites((currentFavorites) =>
        currentFavorites.filter((restaurant) => restaurant.id !== restaurantId)
      );
    }
  }

  useEffect(() => {
    loadFavorites();
  }, [token]);

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
      <AppNavbar />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <Heart className="mx-auto mb-4 text-emerald-300" size={48} />
            <h1 className="text-4xl font-black">Login required</h1>
            <p className="mt-3 text-slate-400">Please login to view your saved restaurants.</p>

            <Link
              to="/login"
              className="mt-6 inline-flex rounded-full bg-emerald-400 px-6 py-3 font-black text-slate-950 hover:bg-emerald-300"
            >
              Login
            </Link>
          </div>
        </div>
            </section>
    </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppNavbar />
      <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mt-10 mb-8">
          <h1 className="text-5xl font-black">Your favorites</h1>
          <p className="mt-3 text-slate-400">
            Restaurants saved by {user.name}. Click the red heart to remove a favorite.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader2 className="animate-spin text-emerald-400" size={42} />
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <Heart className="mx-auto mb-4 text-emerald-300" size={48} />
            <h2 className="text-3xl font-black">No favorites yet</h2>
            <p className="mt-2 text-slate-400">
              Save restaurants from the Explore or Real Nearby page.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isFavorite={true}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </div>
        )}
      </div>
          </section>
    </main>
  );
}


