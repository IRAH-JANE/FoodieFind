import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Heart,
  Loader2,
  Mail,
  MessageSquare,
  ShieldCheck,
  Star,
  Trash2,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppNavbar } from "../components/AppNavbar";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

type RestaurantSummary = {
  id: string;
  name: string;
  category: string;
  imageUrl?: string | null;
};

type UserReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  restaurant: RestaurantSummary;
};

type FavoriteItem = {
  id: string;
  restaurant?: RestaurantSummary;
};

function extractArray<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.reviews)) return payload.data.reviews;
  if (Array.isArray(payload?.data?.favorites)) return payload.data.favorites;
  if (Array.isArray(payload?.reviews)) return payload.reviews;
  if (Array.isArray(payload?.favorites)) return payload.favorites;
  return [];
}

async function apiGet<T>(path: string, token: string): Promise<T[]> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }

  const payload = await response.json();
  return extractArray<T>(payload);
}

async function apiDelete(path: string, token: string) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Delete failed");
  }

  return response.json();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

export function ProfilePage() {
  const { user, token } = useAuth();

  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingReviewId, setDeletingReviewId] = useState("");
  const [error, setError] = useState("");

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  async function loadProfileData() {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const [reviewData, favoriteData] = await Promise.allSettled([
        apiGet<UserReview>("/reviews/me", token),
        apiGet<FavoriteItem>("/favorites", token),
      ]);

      if (reviewData.status === "fulfilled") {
        setReviews(reviewData.value);
      }

      if (favoriteData.status === "fulfilled") {
        setFavorites(favoriteData.value);
      }
    } catch (error) {
      console.error(error);
      setError("Could not load your profile data.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!token) return;

    const confirmed = confirm("Delete this review?");
    if (!confirmed) return;

    try {
      setDeletingReviewId(reviewId);
      await apiDelete(`/reviews/${reviewId}`, token);

      setReviews((currentReviews) =>
        currentReviews.filter((review) => review.id !== reviewId)
      );
    } catch (error) {
      console.error(error);
      alert("Could not delete this review.");
    } finally {
      setDeletingReviewId("");
    }
  }

  useEffect(() => {
    loadProfileData();
  }, [token]);

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <AppNavbar />

        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <User className="mx-auto mb-4 text-emerald-300" size={52} />
            <h1 className="text-4xl font-black">Login required</h1>
            <p className="mt-3 text-slate-400">
              Please login first to view your profile.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-flex rounded-full bg-emerald-400 px-6 py-3 font-black text-slate-950 hover:bg-emerald-300"
            >
              Go to login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppNavbar />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-400 text-slate-950">
                <User size={42} />
              </div>

              <div>
                <p className="mb-2 inline-flex rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                  FoodieFind profile
                </p>

                <h1 className="text-4xl font-black md:text-5xl">
                  {user.name}
                </h1>

                <div className="mt-2 flex items-center gap-2 text-slate-300">
                  <Mail size={17} />
                  {user.email}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-center">
              <p className="text-sm text-slate-400">Account role</p>
              <p className="mt-1 text-2xl font-black text-white">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <MessageSquare className="mb-3 text-emerald-300" size={28} />
            <p className="text-3xl font-black">{reviews.length}</p>
            <p className="text-sm text-slate-400">Reviews written</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <Heart className="mb-3 text-red-400" size={28} />
            <p className="text-3xl font-black">{favorites.length}</p>
            <p className="text-sm text-slate-400">Saved favorites</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <Star className="mb-3 text-yellow-400" size={28} />
            <p className="text-3xl font-black">
              {averageRating ? averageRating.toFixed(1) : "0"}
            </p>
            <p className="text-sm text-slate-400">Average rating</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <ShieldCheck className="mb-3 text-emerald-300" size={28} />
            <p className="text-3xl font-black">Active</p>
            <p className="text-sm text-slate-400">Account status</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr]">
          <section className="h-fit rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-xl">
            <h2 className="text-2xl font-black">Account information</h2>
            <p className="mt-1 text-sm text-slate-400">
              Basic information connected to your FoodieFind account.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Name</p>
                <p className="mt-1 font-black">{user.name}</p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Email</p>
                <p className="mt-1 font-black">{user.email}</p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Role</p>
                <p className="mt-1 font-black">{user.role}</p>
              </div>
            </div>

            <p className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              Later, this section can include edit profile, change password,
              avatar upload, and location preferences.
            </p>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-xl">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black">
                  <MessageSquare className="text-emerald-300" size={28} />
                  Your reviews
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  You have written {reviews.length} review{reviews.length === 1 ? "" : "s"}.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex min-h-64 items-center justify-center rounded-3xl border border-white/10 bg-slate-900">
                <div className="flex items-center gap-3 text-emerald-300">
                  <Loader2 className="animate-spin" size={30} />
                  Loading profile...
                </div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-10 text-center">
                <MessageSquare className="mx-auto mb-4 text-emerald-300" size={44} />
                <h3 className="text-2xl font-black">No reviews yet</h3>
                <p className="mt-2 text-slate-400">
                  Open a restaurant and write your first review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-3xl border border-white/10 bg-slate-900 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-4">
                        <img
                          src={
                            review.restaurant?.imageUrl ||
                            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
                          }
                          alt={review.restaurant?.name || "Restaurant"}
                          className="h-20 w-20 rounded-2xl object-cover"
                        />

                        <div>
                          <h3 className="text-xl font-black">
                            {review.restaurant?.name || "Restaurant"}
                          </h3>

                          <p className="text-sm text-slate-400">
                            {review.restaurant?.category || "Restaurant"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-sm font-black text-slate-950">
                              <Star size={15} />
                              {review.rating}
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">
                              <CalendarDays size={15} />
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deletingReviewId === review.id}
                        className="inline-flex h-10 w-[110px] items-center justify-center gap-2 rounded-full bg-red-500 text-sm font-black text-white transition hover:bg-red-400 disabled:opacity-60"
                      >
                        {deletingReviewId === review.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Delete
                      </button>
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
