import { createContext, useContext, useEffect, useState } from "react";
import type { ExternalPlace } from "../types/place";
import type { LocationInfo } from "./LocationContext";

type NearbySearchContextValue = {
  places: ExternalPlace[];
  setPlaces: React.Dispatch<React.SetStateAction<ExternalPlace[]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  radius: string;
  setRadius: React.Dispatch<React.SetStateAction<string>>;
  hasSearched: boolean;
  setHasSearched: React.Dispatch<React.SetStateAction<boolean>>;
  lastSearchedLocation: LocationInfo | null;
  setLastSearchedLocation: React.Dispatch<React.SetStateAction<LocationInfo | null>>;
  markPlaceImported: (externalId: string, restaurantId: string) => void;
  clearNearbySearch: () => void;
};

const NearbySearchContext = createContext<NearbySearchContextValue | null>(null);

const STORAGE_KEY = "foodiefind_nearby_search";

type StoredNearbySearch = {
  places: ExternalPlace[];
  search: string;
  radius: string;
  hasSearched: boolean;
  lastSearchedLocation: LocationInfo | null;
};

function readStoredNearbySearch(): StoredNearbySearch {
  const fallback: StoredNearbySearch = {
    places: [],
    search: "",
    radius: "1000",
    hasSearched: false,
    lastSearchedLocation: null,
  };

  const stored = sessionStorage.getItem(STORAGE_KEY);

  if (!stored) return fallback;

  try {
    const parsed = JSON.parse(stored) as StoredNearbySearch;

    return {
      places: Array.isArray(parsed.places) ? parsed.places : [],
      search: parsed.search ?? "",
      radius: parsed.radius ?? "1000",
      hasSearched: parsed.hasSearched ?? false,
      lastSearchedLocation: parsed.lastSearchedLocation ?? null,
    };
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return fallback;
  }
}

export function NearbySearchProvider({ children }: { children: React.ReactNode }) {
  const storedNearbySearch = readStoredNearbySearch();

  const [places, setPlaces] = useState<ExternalPlace[]>(storedNearbySearch.places);
  const [search, setSearch] = useState(storedNearbySearch.search);
  const [radius, setRadius] = useState(storedNearbySearch.radius);
  const [hasSearched, setHasSearched] = useState(storedNearbySearch.hasSearched);
  const [lastSearchedLocation, setLastSearchedLocation] = useState<LocationInfo | null>(
    storedNearbySearch.lastSearchedLocation
  );

  useEffect(() => {
    const payload: StoredNearbySearch = {
      places,
      search,
      radius,
      hasSearched,
      lastSearchedLocation,
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [places, search, radius, hasSearched, lastSearchedLocation]);

  function markPlaceImported(externalId: string, restaurantId: string) {
    setPlaces((currentPlaces) =>
      currentPlaces.map((place) => {
        if (place.externalId !== externalId) return place;

        return {
          ...place,
          isImported: true,
          restaurantId,
        };
      })
    );
  }

  function clearNearbySearch() {
    setPlaces([]);
    setSearch("");
    setRadius("1000");
    setHasSearched(false);
    setLastSearchedLocation(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  return (
    <NearbySearchContext.Provider
      value={{
        places,
        setPlaces,
        search,
        setSearch,
        radius,
        setRadius,
        hasSearched,
        setHasSearched,
        lastSearchedLocation,
        setLastSearchedLocation,
        markPlaceImported,
        clearNearbySearch,
      }}
    >
      {children}
    </NearbySearchContext.Provider>
  );
}

export function useNearbySearchContext() {
  const context = useContext(NearbySearchContext);

  if (!context) {
    throw new Error("useNearbySearchContext must be used inside NearbySearchProvider");
  }

  return context;
}
