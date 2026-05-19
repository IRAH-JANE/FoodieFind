import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Compass,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Target,
  Trash2,
  Utensils,
} from "lucide-react";
import { AppNavbar } from "../components/AppNavbar";
import { ExternalPlaceCard } from "../components/ExternalPlaceCard";
import { useLocationContext, type LocationInfo } from "../context/LocationContext";
import { useNearbySearchContext } from "../context/NearbySearchContext";
import { getNearbyPlaces } from "../services/placesApi";

const DAVAO_TEST_LOCATION: LocationInfo = {
  lat: 7.078156,
  lng: 125.589936,
  label: "Using Davao test location",
  source: "DEMO_LOCATION",
};

const MANILA_TEST_LOCATION: LocationInfo = {
  lat: 14.5995,
  lng: 120.9842,
  label: "Using Manila test location",
  source: "DEMO_LOCATION",
};

export function NearbyPlacesPage() {
  const {
    locationInfo,
    isGettingLocation,
    locationError,
    getCurrentLocation,
    setDemoLocation,
  } = useLocationContext();

  const {
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
    clearNearbySearch,
  } = useNearbySearchContext();

  const [importFilter, setImportFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const activeLocation = lastSearchedLocation ?? locationInfo;

  const categories = useMemo(() => {
    return Array.from(new Set(places.map((place) => place.category))).sort();
  }, [places]);

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      if (importFilter === "new" && place.isImported) return false;
      if (importFilter === "saved" && !place.isImported) return false;
      if (categoryFilter && place.category !== categoryFilter) return false;

      return true;
    });
  }, [places, importFilter, categoryFilter]);

  async function loadPlaces(nextLocation: LocationInfo | null = locationInfo) {
    if (!nextLocation) {
      setPlaces([]);
      setHasSearched(false);
      setError("Click “Use my real location” first.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setPlaces([]);

      const data = await getNearbyPlaces({
        lat: nextLocation.lat,
        lng: nextLocation.lng,
        radius: Number(radius),
        search: search || undefined,
      });

      setPlaces(data);
      setHasSearched(true);
      setLastSearchedLocation(nextLocation);
    } catch (error) {
      console.error(error);
      setPlaces([]);
      setHasSearched(true);
      setLastSearchedLocation(nextLocation);
      setError(
        "Nearby search failed. Check your Geoapify API key, backend server, or try a smaller radius."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUseRealLocation() {
    const detectedLocation = await getCurrentLocation();

    if (detectedLocation) {
      await loadPlaces(detectedLocation);
    }
  }

  async function handleUseDavaoTest() {
    setDemoLocation(DAVAO_TEST_LOCATION);
    await loadPlaces(DAVAO_TEST_LOCATION);
  }

  async function handleUseManilaTest() {
    setDemoLocation(MANILA_TEST_LOCATION);
    await loadPlaces(MANILA_TEST_LOCATION);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadPlaces();
  }

  function handleClearSearch() {
    clearNearbySearch();
    setImportFilter("all");
    setCategoryFilter("");
    setError("");
  }

  useEffect(() => {
    if (places.length > 0) {
      setError("");
    }
  }, [places.length]);

  useEffect(() => {
    if (!hasSearched || !lastSearchedLocation) return;

    loadPlaces(lastSearchedLocation);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppNavbar />

      <section className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-200">
              <Utensils size={14} />
              Real nearby food discovery
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              Find real food places near you.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Search live nearby restaurants, cafés, fast food spots, and food places
              using your browser location and Geoapify.
            </p>
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/35 p-4 shadow-2xl backdrop-blur">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {activeLocation ? (
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-300">
                  <div className="mb-1 flex items-center gap-2 font-black text-emerald-300">
                    <Target size={16} />
                    Nearby search location
                  </div>

                  <p className="font-bold text-white">{activeLocation.label}</p>

                  <p className="mt-1">
                    Lat {activeLocation.lat.toFixed(5)} · Lng {activeLocation.lng.toFixed(5)}
                    {activeLocation.accuracy !== undefined
                      ? ` · ±${Math.round(activeLocation.accuracy)}m`
                      : ""}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-300">
                  <div className="mb-1 flex items-center gap-2 font-black text-emerald-300">
                    <Target size={16} />
                    No search location yet
                  </div>

                  <p>Use your real location or test with Davao/Manila first.</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleUseRealLocation}
                  disabled={isGettingLocation || isLoading}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200 disabled:opacity-60"
                >
                  {isGettingLocation ? "Detecting..." : "Use my real location"}
                </button>

                <button
                  onClick={handleUseDavaoTest}
                  disabled={isLoading || isGettingLocation}
                  className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-black text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-60"
                >
                  Davao test
                </button>

                <button
                  onClick={handleUseManilaTest}
                  disabled={isLoading || isGettingLocation}
                  className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-black text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-60"
                >
                  Manila test
                </button>

                {hasSearched && (
                  <button
                    onClick={handleClearSearch}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
                  >
                    <Trash2 size={15} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3 lg:grid-cols-[1fr_160px_auto]">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-950 px-5">
                <Search className="text-slate-400" size={21} />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search cafe, burger, Korean, pizza..."
                  className="h-14 w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <select
                value={radius}
                onChange={(event) => setRadius(event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="500">500 m</option>
                <option value="1000">1 km</option>
                <option value="3000">3 km</option>
                <option value="5000">5 km</option>
              </select>

              <button
                disabled={isLoading || isGettingLocation}
                className="rounded-2xl bg-emerald-400 px-8 py-4 font-black text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"
              >
                {isLoading ? "Searching..." : "Search"}
              </button>
            </form>

            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-black">
                  <SlidersHorizontal size={16} />
                  Nearby filters
                </div>

                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                  {filteredPlaces.length} showing
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={importFilter}
                  onChange={(event) => setImportFilter(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="all">All nearby</option>
                  <option value="new">New only</option>
                  <option value="saved">Already saved</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-9">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black">Real nearby food places</h2>

            <p className="mt-1 text-sm text-slate-400">
              Showing {filteredPlaces.length} of {places.length} place
              {places.length === 1 ? "" : "s"} from Geoapify.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-slate-300">
            <Compass size={15} />
            Live nearby results
          </div>
        </div>

        {(error || locationError) && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error || locationError}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-3 text-emerald-300">
              <Loader2 className="animate-spin" size={34} />
              Searching nearby places...
            </div>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <MapPin className="mx-auto mb-4 text-emerald-300" size={46} />

            <h3 className="text-2xl font-black">
              {hasSearched ? "No nearby places found" : "No nearby search yet"}
            </h3>

            <p className="mt-2 text-slate-400">
              {hasSearched
                ? "Try another keyword, category, or a larger radius."
                : "Use your location, then search for cafe, burger, Korean, or restaurant."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPlaces.map((place) => (
              <ExternalPlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
