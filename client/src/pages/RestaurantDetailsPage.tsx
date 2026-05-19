import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Clock,
  ExternalLink,
  Heart,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Star,
  Tag,
  Utensils,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppNavbar } from "../components/AppNavbar";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
};

type Restaurant = {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  priceLevel: string;
  imageUrl?: string | null;
  openingHours?: string | null;
  phone?: string | null;
  website?: string | null;
  externalSource?: string | null;
  externalId?: string | null;
  isTrending?: boolean;
  isHiddenGem?: boolean;
  isAffordable?: boolean;
  isVerified?: boolean;
  isFavorited?: boolean;
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
  favoriteCount?: number;
};

function unwrapRestaurant(payload: any): Restaurant {
  return payload?.data?.restaurant ?? payload?.data ?? payload?.restaurant ?? payload;
}

function getReviews(restaurant: Restaurant): Review[] {
  return Array.isArray(restaurant.reviews) ? restaurant.reviews : [];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

function priceLabel(priceLevel?: string) {
  if (priceLevel === "CHEAP") return "Cheap price";
  if (priceLevel === "EXPENSIVE") return "Expensive price";
  return "Moderate price";
}

function mapsUrl(restaurant: Restaurant) {
  return `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`;
}

function fallbackImage(category?: string) {
  const normalized = category?.toLowerCase() ?? "";

  if (normalized.includes("burger") || normalized.includes("fast")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd";
  }

  if (normalized.includes("cafe") || normalized.includes("coffee")) {
    return "https://images.unsplash.com/photo-1554118811-1e0d58224f24";
  }

  if (normalized.includes("dessert") || normalized.includes("bakery")) {
    return "https://images.unsplash.com/photo-1551024506-0bccd828d307";
  }

  return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";
}

async function requestJson(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

async function submitReviewRequest(restaurantId: string, token: string, rating: number, comment: string) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    return await requestJson(`/reviews/${restaurantId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ rating, comment }),
    });
  } catch {
    return requestJson("/reviews", {
      method: "POST",
      headers,
      body: JSON.stringify({ restaurantId, rating, comment }),
    });
  }
}

async function toggleFavoriteRequest(restaurantId: string, token: string, isFavorite: boolean) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  if (isFavorite) {
    try {
      return await requestJson(`/favorites/${restaurantId}`, {
        method: "DELETE",
        headers,
      });
    } catch {
      return requestJson(`/favorites/restaurant/${restaurantId}`, {
        method: "DELETE",
        headers,
      });
    }
  }

  try {
    return await requestJson(`/favorites/${restaurantId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });
  } catch {
    return requestJson("/favorites", {
      method: "POST",
      headers,
      body: JSON.stringify({ restaurantId }),
    });
  }
}

export function RestaurantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const fromNearby = Boolean((location.state as any)?.fromNearby);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [error, setError] = useState("");

  const reviews = useMemo(() => {
    if (!restaurant) return [];
    return getReviews(restaurant);
  }, [restaurant]);

  const averageRating = useMemo(() => {
    if (!restaurant) return 0;

    if (typeof restaurant.averageRating === "number") {
      return restaurant.averageRating;
    }

    if (reviews.length === 0) return 0;

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [restaurant, reviews]);

  async function loadRestaurant() {
    if (!id) return;

    try {
      setIsLoading(true);
      setError("");

      const headers: Record<string, string> = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const payload = await requestJson(`/restaurants/${id}`, {
        headers,
      });

      const restaurantData = unwrapRestaurant(payload);
      setRestaurant(restaurantData);

      setIsFavorite(
        Boolean(
          restaurantData.isFavorited ||
            restaurantData.isFavorite ||
            restaurantData.favoritedByMe
        )
      );
    } catch (error) {
      console.error(error);
      setError("Could not load restaurant details.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleFavorite() {
    if (!restaurant) return;

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsTogglingFavorite(true);
      await toggleFavoriteRequest(restaurant.id, token, isFavorite);
      setIsFavorite((current) => !current);
    } catch (error) {
      console.error(error);
      alert("Could not update favorite.");
    } finally {
      setIsTogglingFavorite(false);
    }
  }

  async function handleSubmitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!restaurant || !token) {
      navigate("/login");
      return;
    }

    if (!comment.trim()) {
      alert("Please write a review comment first.");
      return;
    }

    try {
      setIsSubmittingReview(true);

      await submitReviewRequest(restaurant.id, token, rating, comment.trim());

      setComment("");
      setRating(5);
      await loadRestaurant();
    } catch (error) {
      console.error(error);
      alert("Could not submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  }

  useEffect(() => {
    loadRestaurant();
  }, [id, token]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <AppNavbar />

        <section className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-6">
          <div className="flex items-center gap-3 text-emerald-300">
            <Loader2 className="animate-spin" size={38} />
            Loading restaurant...
          </div>
        </section>
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <AppNavbar />

        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-10 text-center text-red-100">
            <h1 className="text-3xl font-black">Restaurant not found</h1>
            <p className="mt-3">{error || "This restaurant could not be loaded."}</p>

            <button
              onClick={() => navigate(fromNearby ? "/nearby" : "/")}
              className="mt-6 rounded-full bg-white px-6 py-3 font-black text-slate-950"
            >
              Go back
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppNavbar />

      <section className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-6">
            <button
              onClick={() => navigate(fromNearby ? "/nearby" : "/")}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-emerald-200 transition hover:bg-white/20"
            >
              ← {fromNearby ? "Back to nearby results" : "Back to home"}
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
              <img
                src={restaurant.imageUrl || fallbackImage(restaurant.category)}
                alt={restaurant.name}
                className="h-[320px] w-full object-cover"
              />
            </div>

            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {restaurant.externalSource && (
                  <span className="rounded-full bg-blue-500 px-4 py-2 text-xs font-black text-white">
                    Real nearby place
                  </span>
                )}

                {restaurant.isVerified && (
                  <span className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-black text-slate-950">
                    Verified
                  </span>
                )}

                {restaurant.isTrending && (
                  <span className="rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-white">
                    Trending
                  </span>
                )}

                {restaurant.isHiddenGem && (
                  <span className="rounded-full bg-purple-500 px-4 py-2 text-xs font-black text-white">
                    Hidden gem
                  </span>
                )}

                {restaurant.isAffordable && (
                  <span className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-black text-slate-950">
                    Affordable
                  </span>
                )}
              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-6xl">
                {restaurant.name}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                {restaurant.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950">
                  <Star size={17} />
                  {averageRating ? averageRating.toFixed(1) : "0"} rating
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                  <Tag size={17} />
                  {restaurant.category}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                  <Utensils size={17} />
                  {priceLabel(restaurant.priceLevel)}
                </span>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite}
                  className={`inline-flex h-12 w-[175px] items-center justify-center gap-2 rounded-full text-sm font-black transition disabled:opacity-60 ${
                    isFavorite
                      ? "bg-red-500 text-white hover:bg-red-400"
                      : "bg-white text-slate-950 hover:bg-emerald-200"
                  }`}
                >
                  {isTogglingFavorite ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                  )}
                  {isFavorite ? "Saved" : "Save"}
                </button>

                <a
                  href={mapsUrl(restaurant)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 w-[175px] items-center justify-center gap-2 rounded-full bg-white/10 text-sm font-black text-white transition hover:bg-white/20"
                >
                  <ExternalLink size={18} />
                  Open maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-9 lg:grid-cols-[0.9fr_1.2fr]">
        <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-xl">
          <h2 className="text-2xl font-black">Restaurant info</h2>
          <p className="mt-1 text-sm text-slate-400">
            Basic details saved in FoodieFind.
          </p>

          <div className="mt-6 space-y-5">
            <div className="flex gap-3">
              <MapPin className="mt-1 shrink-0 text-emerald-300" size={21} />
              <div>
                <p className="font-black">Address</p>
                <p className="mt-1 text-slate-300">{restaurant.address || "Address not available"}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Clock className="mt-1 shrink-0 text-emerald-300" size={21} />
              <div>
                <p className="font-black">Opening hours</p>
                <p className="mt-1 text-slate-300">{restaurant.openingHours || "Not available"}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone className="mt-1 shrink-0 text-emerald-300" size={21} />
              <div>
                <p className="font-black">Phone</p>
                <p className="mt-1 text-slate-300">{restaurant.phone || "Not available"}</p>
              </div>
            </div>
          </div>

          <a
            href={mapsUrl(restaurant)}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-black text-slate-950 transition hover:bg-emerald-200"
          >
            <ExternalLink size={17} />
            Open location in Maps
          </a>
        </aside>

        <div className="space-y-8">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-xl">
            <h2 className="text-2xl font-black">Write a review</h2>
            <p className="mt-1 text-sm text-slate-400">
              Share your experience with other FoodieFind users.
            </p>

            <form onSubmit={handleSubmitReview} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-black">Rating</label>
                <select
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Okay</option>
                  <option value={2}>2 - Bad</option>
                  <option value={1}>1 - Terrible</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black">Comment</label>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Share your experience..."
                  className="min-h-32 w-full resize-y rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <button
                disabled={isSubmittingReview}
                className="inline-flex h-11 w-[160px] items-center justify-center gap-2 rounded-full bg-emerald-400 text-sm font-black text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"
              >
                {isSubmittingReview ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <Send size={17} />
                )}
                Submit
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-xl">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black">
                  <MessageSquare className="text-emerald-300" size={26} />
                  Community reviews
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {reviews.length} review{reviews.length === 1 ? "" : "s"} from FoodieFind users.
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 text-slate-300">
                No reviews yet.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-3xl border border-white/10 bg-slate-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-black">
                          {review.user?.name || "FoodieFind user"}
                        </h3>

                        <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-400">
                          <CalendarDays size={14} />
                          {formatDate(review.createdAt)}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-sm font-black text-slate-950">
                        <Star size={15} />
                        {review.rating}
                      </span>
                    </div>

                    <p className="mt-4 text-slate-200">{review.comment}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
