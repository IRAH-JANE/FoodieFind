import { useState } from "react";
import { CheckCircle, ExternalLink, Loader2, MapPin, Save, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { importExternalPlace } from "../services/placesApi";
import type { ExternalPlace } from "../types/place";

type ExternalPlaceCardProps = {
  place: ExternalPlace;
};

function openMapsUrl(place: ExternalPlace) {
  return `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
}

function getRestaurantIdFromResponse(response: any) {
  return (
    response?.data?.restaurantId ||
    response?.data?.id ||
    response?.data?.restaurant?.id ||
    response?.restaurantId ||
    response?.restaurant?.id ||
    response?.id ||
    null
  );
}

export function ExternalPlaceCard({ place }: ExternalPlaceCardProps) {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [isImported, setIsImported] = useState(Boolean(place.isImported));
  const [restaurantId, setRestaurantId] = useState(place.restaurantId ?? null);

  async function handleSave() {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsSaving(true);

      const response = await importExternalPlace(place, token);
      console.log("Import response:", response);

      const newRestaurantId = getRestaurantIdFromResponse(response);

      if (!newRestaurantId) {
        alert("The place may have been saved, but FoodieFind could not open it. Refresh the page and check the homepage.");
        return;
      }

      setIsImported(true);
      setRestaurantId(newRestaurantId);

      navigate(`/restaurants/${newRestaurantId}`, {
        state: { fromNearby: true },
      });
    } catch (error) {
      console.error("Save to FoodieFind failed:", error);
      alert("Could not save this place to FoodieFind. Check the backend terminal for the exact error.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleViewInFoodieFind() {
    if (!restaurantId) return;

    navigate(`/restaurants/${restaurantId}`, {
      state: { fromNearby: true },
    });
  }

  return (
    <article className="flex min-h-[270px] flex-col rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl transition hover:-translate-y-1 hover:bg-white/[0.13]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-xl font-black leading-tight text-white">
            {place.name}
          </h3>

          <p className="mt-1 text-xs font-medium text-slate-400">
            Source: OpenStreetMap
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">
          {place.distanceKm.toFixed(2)} km
        </span>
      </div>

      {isImported && (
        <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
          <CheckCircle size={13} />
          Already in FoodieFind
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
          <Tag size={12} />
          {place.category}
        </span>

        {place.cuisine && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
            {place.cuisine}
          </span>
        )}
      </div>

      <div className="mb-4 flex gap-2 text-sm text-slate-300">
        <MapPin className="mt-0.5 shrink-0 text-emerald-300" size={16} />
        <p className="line-clamp-3">{place.address || "Address not available"}</p>
      </div>

      {place.openingHours && (
        <p className="mb-4 text-xs font-semibold text-slate-400">
          {place.openingHours}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
        {isImported ? (
          <button
            onClick={handleViewInFoodieFind}
            className="inline-flex h-9 w-[130px] items-center justify-center gap-1.5 rounded-full bg-white text-xs font-black text-slate-950 transition hover:bg-emerald-200"
          >
            <CheckCircle size={14} />
            View saved
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex h-9 w-[130px] items-center justify-center gap-1.5 rounded-full bg-emerald-400 text-xs font-black text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {isSaving ? "Saving..." : "Save"}
          </button>
        )}

        <a
          href={openMapsUrl(place)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 w-[95px] items-center justify-center gap-1.5 rounded-full bg-white text-xs font-black text-slate-950 transition hover:bg-slate-200"
        >
          <ExternalLink size={14} />
          Maps
        </a>
      </div>
    </article>
  );
}
