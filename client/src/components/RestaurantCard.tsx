import { Heart, Loader2, MapPin, Star, Tag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Restaurant } from "../types/restaurant";
import { useAuth } from "../context/AuthContext";
import { removeFavorite, saveFavorite } from "../services/favoriteApi";
import { getRestaurantImage } from "../utils/restaurantImages";

type RestaurantCardProps = {
  restaurant: Restaurant;
  isFavorite?: boolean;
  onFavoriteChange?: (restaurantId: string, isFavorite: boolean) => void;
};

function priceLabel(priceLevel: Restaurant["priceLevel"]) {
  if (priceLevel === "CHEAP") return "P";
  if (priceLevel === "MODERATE") return "PP";
  return "PPP";
}

export function RestaurantCard({
  restaurant,
  isFavorite,
  onFavoriteChange,
}: RestaurantCardProps) {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [localFavorite, setLocalFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentFavorite = isFavorite ?? localFavorite;

  useEffect(() => {
    if (typeof isFavorite === "boolean") {
      setLocalFavorite(isFavorite);
    }
  }, [isFavorite]);

  async function handleFavoriteClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!user || !token) {
      navigate("/login");
      return;
    }

    try {
      setIsSaving(true);

      if (currentFavorite) {
        await removeFavorite(restaurant.id, token);
        setLocalFavorite(false);
        onFavoriteChange?.(restaurant.id, false);
      } else {
        await saveFavorite(restaurant.id, token);
        setLocalFavorite(true);
        onFavoriteChange?.(restaurant.id, true);
      }
    } catch {
      alert("Could not update favorite.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
      <Link to={`/restaurants/${restaurant.id}`} className="block">
        <div className="relative h-52 overflow-hidden">
          <img
            src={getRestaurantImage(restaurant.category, restaurant.imageUrl)}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {restaurant.externalSource && (
              <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">
                Real Nearby
              </span>
            )}

            {restaurant.isVerified && (
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                Verified
              </span>
            )}

            {restaurant.isTrending && (
              <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                Trending
              </span>
            )}

            {restaurant.isHiddenGem && (
              <span className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">
                Hidden Gem
              </span>
            )}

            {restaurant.isAffordable && (
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                Affordable
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={isSaving}
            className={`absolute right-4 top-4 rounded-full p-3 backdrop-blur transition disabled:opacity-50 ${
              currentFavorite
                ? "bg-red-500 text-white hover:bg-red-400"
                : "bg-black/50 text-white hover:bg-black/70"
            }`}
            title={currentFavorite ? "Remove from favorites" : "Save to favorites"}
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Heart size={18} fill={currentFavorite ? "currentColor" : "none"} />
            )}
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold text-white">{restaurant.name}</h3>

              <div className="flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-slate-950">
                <Star size={15} fill="currentColor" />
                {restaurant.averageRating}
              </div>
            </div>

            <p className="mt-2 line-clamp-2 text-sm text-slate-300">
              {restaurant.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-slate-200">
              <Tag size={13} />
              {restaurant.category}
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1 text-slate-200">
              {priceLabel(restaurant.priceLevel)}
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1 text-slate-200">
              {restaurant.reviewCount} reviews
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin size={16} />
            <span className="line-clamp-1">{restaurant.address}</span>
          </div>

          {restaurant.distanceKm !== null && (
            <p className="text-sm font-semibold text-emerald-300">
              {restaurant.distanceKm} km away
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

