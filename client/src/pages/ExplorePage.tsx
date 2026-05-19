import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Compass,
  Database,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppNavbar } from "../components/AppNavbar";
import { RestaurantCard } from "../components/RestaurantCard";
import { useLocationContext } from "../context/LocationContext";
import { getRestaurants } from "../services/restaurantApi";
import type { Restaurant } from "../types/restaurant";

const categoryOptions = [
  "Cafe",
  "Fast Food",
  "Restaurant",
  "Bakery",
  "Dessert",
  "Korean",
  "Japanese",
  "Budget Meal",
];

export function ExplorePage() {
  const { locationInfo } = useLocationContext();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [tag, setTag] = useState("");
  const [priceLevel, setPriceLevel] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState<"all" | "real" | "manual">("real");
  const [sort, setSort] = useState("nearest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const activeFilterCount = useMemo(() => {
    return [
      submittedSearch,
      tag,
      priceLevel,
      category,
      source !== "real" ? source : "",
      sort !== "nearest" ? sort : "",
    ].filter(Boolean).length;
  }, [submittedSearch, tag, priceLevel, category, source, sort]);

  async function loadRestaurants() {
    try {
      setIsLoading(true);
      setError("");

      const data = await getRestaurants({
        search: submittedSearch || undefined,
        tag: tag || undefined,
        priceLevel: priceLevel || undefined,
        category: category || undefined,
        source,
        sort,
        lat: locationInfo?.lat,
        lng: locationInfo?.lng,
      });

      setRestaurants(data);
    } catch (error) {
      console.error(error);
      setError("Could not load restaurants. Check if your backend server is running.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(searchInput.trim());
  }

  function clearFilters() {
    setSearchInput("");
    setSubmittedSearch("");
    setTag("");
    setPriceLevel("");
    setCategory("");
    setSource("real");
    setSort("nearest");
  }

  useEffect(() => {
    loadRestaurants();
  }, [
    submittedSearch,
    tag,
    priceLevel,
    category,
    source,
    sort,
    locationInfo?.lat,
    locationInfo?.lng,
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppNavbar />

      <section className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-200">
              <Sparkles size={14} />
              Real restaurants, favorites, reviews, and nearby discovery
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              Find your next favorite food spot.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Search restaurants imported from real nearby results, save favorites,
              and build a cleaner local food discovery database.
            </p>
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/35 p-4 shadow-2xl backdrop-blur">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {locationInfo ? (
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-300">
                  <p className="font-black text-emerald-300">{locationInfo.label}</p>
                  <p className="mt-1">
                    Lat {locationInfo.lat.toFixed(5)} · Lng {locationInfo.lng.toFixed(5)}
                    {locationInfo.accuracy !== undefined
                      ? ` · ±${Math.round(locationInfo.accuracy)}m`
                      : ""}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-300">
                  <p className="font-black text-emerald-300">No location selected</p>
                  <p className="mt-1">Use location to sort by nearest restaurants.</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/nearby"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
                >
                  <Compass size={16} />
                  Find real nearby
                </Link>

                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/20"
                >
                  <X size={16} />
                  Clear
                </button>
              </div>
            </div>

            <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-950 px-5">
                <Search className="text-slate-400" size={21} />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search cafe, burger, ramen, Korean..."
                  className="h-14 w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <button className="rounded-2xl bg-emerald-400 px-8 py-4 font-black text-slate-950 transition hover:bg-emerald-300">
                Search
              </button>
            </form>

            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-black">
                  <SlidersHorizontal size={16} />
                  Filters
                </div>

                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                  {activeFilterCount} active
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                <select
                  value={tag}
                  onChange={(event) => setTag(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">All tags</option>
                  <option value="trending">Trending</option>
                  <option value="hidden">Hidden gems</option>
                  <option value="affordable">Affordable</option>
                  <option value="verified">Verified</option>
                </select>

                <select
                  value={priceLevel}
                  onChange={(event) => setPriceLevel(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">All prices</option>
                  <option value="CHEAP">Cheap</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="EXPENSIVE">Expensive</option>
                </select>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">All categories</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={source}
                  onChange={(event) =>
                    setSource(event.target.value as "all" | "real" | "manual")
                  }
                  className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="real">Real nearby</option>
                  <option value="manual">Manual</option>
                  <option value="all">All sources</option>
                </select>

                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="nearest">Nearest</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Highest rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-9">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black">Explore restaurants</h2>
            <p className="mt-1 text-sm text-slate-400">
              Showing {restaurants.length} food spot{restaurants.length === 1 ? "" : "s"} from your PostgreSQL database.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-slate-300">
            <Database size={15} />
            PostgreSQL + Geoapify
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-3 text-emerald-300">
              <Loader2 className="animate-spin" size={34} />
              Loading restaurants...
            </div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <MapPin className="mx-auto mb-4 text-emerald-300" size={46} />
            <h3 className="text-2xl font-black">No restaurants found</h3>
            <p className="mt-2 text-slate-400">
              Try clearing filters or import real places from the Real Nearby page.
            </p>

            <Link
              to="/nearby"
              className="mt-6 inline-flex rounded-full bg-emerald-400 px-6 py-3 font-black text-slate-950 hover:bg-emerald-300"
            >
              Find nearby places
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
