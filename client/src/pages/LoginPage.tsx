import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, LogIn, Utensils } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("user@foodiefind.com");
  const [password, setPassword] = useState("user12345");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      await login(email, password);
      navigate("/");
    } catch {
      setError("Login failed. Check your email and password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 px-6 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200">
          <ArrowLeft size={18} />
          Back to explore
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-400 p-3 text-slate-950">
            <Utensils size={26} />
          </div>

          <div>
            <h1 className="text-3xl font-black">Welcome back</h1>
            <p className="text-slate-300">Login to your FoodieFind account.</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-200">
              Email
            </label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none focus:border-emerald-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-200">
              Password
            </label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none focus:border-emerald-400"
              placeholder="Your password"
            />
          </div>

          <button
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-slate-300">
          No account yet?{" "}
          <Link to="/register" className="font-bold text-emerald-300 hover:text-emerald-200">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
