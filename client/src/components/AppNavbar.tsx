import {
  Compass,
  Heart,
  Home,
  LogIn,
  LogOut,
  MapPin,
  ShieldCheck,
  User,
  Utensils,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLocationContext } from "../context/LocationContext";

function navClass(isActive: boolean) {
  return `inline-flex h-10 min-w-[105px] items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-black leading-none transition ${
    isActive
      ? "bg-emerald-400 text-slate-950"
      : "bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white"
  }`;
}

function actionButtonClass() {
  return "inline-flex h-10 min-w-[120px] items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-black leading-none transition";
}

export function AppNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getCurrentLocation, isGettingLocation } = useLocationContext();

  async function handleUseLocation() {
    await getCurrentLocation();
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-6">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
            <Utensils size={23} />
          </div>

          <div className="leading-none">
            <p className="text-lg font-black text-white">FoodieFind</p>
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              Discover food near you
            </p>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-2 xl:flex">
          <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>
            <Home size={15} />
            Home
          </NavLink>

          <NavLink to="/nearby" className={({ isActive }) => navClass(isActive)}>
            <Compass size={15} />
            Nearby
          </NavLink>

          <button
            onClick={handleUseLocation}
            disabled={isGettingLocation}
            className={`${actionButtonClass()} bg-white text-slate-950 hover:bg-emerald-200 disabled:opacity-60`}
          >
            <MapPin size={15} />
            {isGettingLocation ? "Locating..." : "Use location"}
          </button>

          {user && (
            <>
              <NavLink to="/favorites" className={({ isActive }) => navClass(isActive)}>
                <Heart size={15} />
                Favorites
              </NavLink>

              <NavLink to="/profile" className={({ isActive }) => navClass(isActive)}>
                <User size={15} />
                Profile
              </NavLink>
            </>
          )}

          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={({ isActive }) => navClass(isActive)}>
              <ShieldCheck size={15} />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          {user ? (
            <>
              <span className="inline-flex h-10 max-w-[155px] items-center justify-center truncate whitespace-nowrap rounded-full bg-white/10 px-4 text-sm font-black leading-none text-white">
                {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="inline-flex h-10 min-w-[105px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-red-500 px-4 text-sm font-black leading-none text-white transition hover:bg-red-400"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-10 min-w-[105px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-emerald-400 px-4 text-sm font-black leading-none text-slate-950 transition hover:bg-emerald-300"
            >
              <LogIn size={15} />
              Login
            </Link>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto xl:hidden">
          <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>
            <Home size={15} />
            Home
          </NavLink>

          <NavLink to="/nearby" className={({ isActive }) => navClass(isActive)}>
            <Compass size={15} />
            Nearby
          </NavLink>

          <button
            onClick={handleUseLocation}
            disabled={isGettingLocation}
            className={`${actionButtonClass()} shrink-0 bg-white text-slate-950`}
          >
            <MapPin size={15} />
            Location
          </button>

          {user && (
            <>
              <NavLink to="/favorites" className={({ isActive }) => navClass(isActive)}>
                <Heart size={15} />
                Favorites
              </NavLink>

              <NavLink to="/profile" className={({ isActive }) => navClass(isActive)}>
                <User size={15} />
                Profile
              </NavLink>
            </>
          )}

          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={({ isActive }) => navClass(isActive)}>
              <ShieldCheck size={15} />
              Admin
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
