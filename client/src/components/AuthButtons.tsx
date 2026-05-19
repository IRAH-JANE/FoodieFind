import { Link } from "react-router-dom";
import { Heart, LayoutDashboard, LogIn, LogOut, MapPin, Shield, User, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AuthButtons() {
  const { user, logout, isLoading } = useAuth();

  const nearbyLink = (
    <Link
      to="/nearby"
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
    >
      <MapPin size={18} />
      Real Nearby
    </Link>
  );

  if (isLoading) {
    return (
      <div className="rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-slate-300">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {nearbyLink}

        <Link
          to="/login"
          className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-200"
        >
          <LogIn size={18} />
          Login
        </Link>

        <Link
          to="/register"
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
        >
          <UserPlus size={18} />
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {nearbyLink}

      {user.role === "ADMIN" && (
        <Link
          to="/admin"
          className="flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
        >
          <LayoutDashboard size={18} />
          Admin
        </Link>
      )}

      <Link
        to="/favorites"
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
      >
        <Heart size={18} />
        Favorites
      </Link>

      <Link
        to="/profile"
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
      >
        <User size={18} />
        Profile
      </Link>

      <div className="hidden rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white md:block">
        {user.role === "ADMIN" && (
          <span className="mr-2 inline-flex items-center gap-1 text-emerald-300">
            <Shield size={14} />
            Admin
          </span>
        )}
        {user.name}
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 rounded-full bg-red-500 px-5 py-3 font-bold text-white transition hover:bg-red-400"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
