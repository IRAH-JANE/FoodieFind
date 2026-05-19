import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, MessageSquare, Shield, Star, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { deleteReview, getAllReviews, type AdminReview } from "../services/reviewApi";

export function AdminReviewsPage() {
  const { user, token } = useAuth();

  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReviews() {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const data = await getAllReviews(token);
      setReviews(data);
    } catch {
      setError("Could not load reviews.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!token) return;

    const confirmed = confirm("Delete this review?");
    if (!confirmed) return;

    try {
      await deleteReview(reviewId, token);
      setReviews((currentReviews) =>
        currentReviews.filter((review) => review.id !== reviewId)
      );
    } catch {
      alert("Could not delete review.");
    }
  }

  useEffect(() => {
    loadReviews();
  }, [token]);

  if (!user || user.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200">
            <ArrowLeft size={18} />
            Back to explore
          </Link>

          <div className="mt-10 rounded-3xl border border-red-500/30 bg-red-500/10 p-10 text-center">
            <Shield className="mx-auto mb-4 text-red-300" size={48} />
            <h1 className="text-3xl font-black">Admin access required</h1>
            <p className="mt-2 text-red-100">Only admins can manage reviews.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/admin" className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200">
            <ArrowLeft size={18} />
            Back to admin dashboard
          </Link>

          <Link
            to="/"
            className="rounded-full bg-white px-5 py-3 font-bold text-slate-950 hover:bg-emerald-200"
          >
            Explore app
          </Link>
        </div>

        <header className="mt-8 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-emerald-300">
            <MessageSquare size={18} />
            Review Management
          </div>

          <h1 className="mt-4 text-5xl font-black">Manage reviews</h1>
          <p className="mt-2 text-slate-400">
            View and remove community reviews from FoodieFind.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader2 className="animate-spin text-emerald-400" size={42} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <MessageSquare className="mx-auto mb-4 text-emerald-300" size={48} />
            <h2 className="text-2xl font-black">No reviews yet</h2>
            <p className="mt-2 text-slate-400">Reviews will appear here when users post them.</p>
          </div>
        ) : (
          <section className="space-y-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-xl font-black">{review.restaurant.name}</h2>
                      <p className="text-sm text-slate-400">
                        {review.restaurant.category}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-sm font-black text-slate-950">
                        <Star size={15} fill="currentColor" />
                        {review.rating}
                      </div>

                      <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">
                        By {review.user.name}
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">
                        {review.user.email}
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="max-w-3xl text-slate-300">{review.comment}</p>
                  </div>

                  <button
                    onClick={() => handleDelete(review.id)}
                    className="flex items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 font-bold text-white hover:bg-red-400"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
