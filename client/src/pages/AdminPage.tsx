import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Database,
  Edit3,
  Loader2,
  Search,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { AppNavbar } from "../components/AppNavbar";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

type Restaurant = {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  address?: string | null;
  phone?: string | null;
  openingHours?: string | null;
  imageUrl?: string | null;
  externalSource?: string | null;
};

type EditForm = {
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  openingHours: string;
  imageUrl: string;
};

function extractRestaurants(payload: any): Restaurant[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.restaurants)) return payload.data.restaurants;
  if (Array.isArray(payload?.restaurants)) return payload.restaurants;
  return [];
}

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function getRestaurants(token: string) {
  const response = await fetch(`${API_URL}/restaurants`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Could not load restaurants");
  }

  const payload = await response.json();
  return extractRestaurants(payload);
}

async function updateRestaurant(token: string, restaurantId: string, data: EditForm) {
  const response = await fetch(`${API_URL}/admin/restaurants/${restaurantId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Could not update restaurant");
  }

  return response.json();
}

async function deleteRestaurant(token: string, restaurantId: string) {
  const response = await fetch(`${API_URL}/admin/restaurants/${restaurantId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || `Delete failed with status ${response.status}`);
  }

  return payload;
}

export function AdminPage() {
  const { user, token } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");

  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    category: "",
    description: "",
    address: "",
    phone: "",
    openingHours: "",
    imageUrl: "",
  });

  const stats = useMemo(() => {
    const total = restaurants.length;
    const imported = restaurants.filter((restaurant) => restaurant.externalSource).length;
    const manual = total - imported;
    const missingAddress = restaurants.filter((restaurant) => !restaurant.address).length;

    return { total, imported, manual, missingAddress };
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        restaurant.name.toLowerCase().includes(keyword) ||
        restaurant.category.toLowerCase().includes(keyword) ||
        restaurant.address?.toLowerCase().includes(keyword);

      const matchesSource =
        sourceFilter === "all" ||
        (sourceFilter === "real" && restaurant.externalSource) ||
        (sourceFilter === "manual" && !restaurant.externalSource);

      return matchesSearch && matchesSource;
    });
  }, [restaurants, search, sourceFilter]);

  async function loadRestaurants() {
    if (!token) return;

    try {
      setIsLoading(true);
      setError("");

      const data = await getRestaurants(token);
      setRestaurants(data);
    } catch (error) {
      console.error(error);
      setError("Could not load admin restaurants.");
    } finally {
      setIsLoading(false);
    }
  }

  function openEdit(restaurant: Restaurant) {
    setEditingRestaurant(restaurant);
    setEditForm({
      name: restaurant.name || "",
      category: restaurant.category || "",
      description: restaurant.description || "",
      address: restaurant.address || "",
      phone: restaurant.phone || "",
      openingHours: restaurant.openingHours || "",
      imageUrl: restaurant.imageUrl || "",
    });
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !editingRestaurant) return;

    try {
      setActionId(editingRestaurant.id);

      await updateRestaurant(token, editingRestaurant.id, editForm);

      setRestaurants((current) =>
        current.map((restaurant) =>
          restaurant.id === editingRestaurant.id
            ? { ...restaurant, ...editForm }
            : restaurant
        )
      );

      setEditingRestaurant(null);
    } catch (error) {
      console.error(error);
      alert("Could not update this restaurant.");
    } finally {
      setActionId("");
    }
  }

  async function handleDelete(restaurantId: string) {
    if (!token) return;

    const confirmed = confirm("Delete this restaurant from FoodieFind?");
    if (!confirmed) return;

    try {
      setActionId(restaurantId);
      await deleteRestaurant(token, restaurantId);

      setRestaurants((current) =>
        current.filter((restaurant) => restaurant.id !== restaurantId)
      );
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Could not delete this restaurant.");
    } finally {
      setActionId("");
    }
  }

  function clearFilters() {
    setSearch("");
    setSourceFilter("all");
  }

  useEffect(() => {
    loadRestaurants();
  }, [token]);

  if (!user || user.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <AppNavbar />

        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-10 text-center">
            <h1 className="text-4xl font-black">Admin access required</h1>
            <p className="mt-3 text-red-100">
              Only admin accounts can manage FoodieFind places.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppNavbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-300">
            <Store size={15} />
            FoodieFind admin
          </div>

          <h1 className="text-4xl font-black md:text-5xl">
            Manage restaurants
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Edit imported restaurant data, fix bad details, and delete low-quality records.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <Database className="mb-3 text-emerald-300" size={28} />
            <p className="text-3xl font-black">{stats.total}</p>
            <p className="text-sm text-slate-400">Total restaurants</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <Store className="mb-3 text-blue-300" size={28} />
            <p className="text-3xl font-black">{stats.imported}</p>
            <p className="text-sm text-slate-400">Imported places</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <Store className="mb-3 text-slate-300" size={28} />
            <p className="text-3xl font-black">{stats.manual}</p>
            <p className="text-sm text-slate-400">Manual places</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <X className="mb-3 text-yellow-300" size={28} />
            <p className="text-3xl font-black">{stats.missingAddress}</p>
            <p className="text-sm text-slate-400">Missing address</p>
          </div>
        </div>

        <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-950 px-4">
              <Search className="text-slate-400" size={20} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, category, address..."
                className="h-12 w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all">All sources</option>
              <option value="real">Imported only</option>
              <option value="manual">Manual only</option>
            </select>

            <button
              onClick={clearFilters}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
            >
              <X size={16} />
              Clear
            </button>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-2xl font-black">Restaurant records</h2>
          <p className="mt-1 text-sm text-slate-400">
            Showing {filteredRestaurants.length} of {restaurants.length} places.
          </p>
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
              Loading admin data...
            </div>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <Store className="mx-auto mb-4 text-emerald-300" size={48} />
            <h3 className="text-2xl font-black">No restaurants found</h3>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-xl">
            <div className="hidden grid-cols-[1.5fr_0.7fr_170px] border-b border-white/10 bg-white/5 px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-400 lg:grid">
              <span>Restaurant</span>
              <span>Source</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-white/10">
              {filteredRestaurants.map((restaurant) => (
                <article
                  key={restaurant.id}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[1.5fr_0.7fr_170px] lg:items-center"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-black">{restaurant.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{restaurant.category}</p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {restaurant.address || "Address not available"}
                    </p>
                  </div>

                  <div>
                    {restaurant.externalSource ? (
                      <span className="inline-flex rounded-full bg-blue-500 px-3 py-1 text-xs font-black text-white">
                        Imported
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
                        Manual
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                    <button
                      onClick={() => openEdit(restaurant)}
                      disabled={actionId === restaurant.id}
                      className="inline-flex h-9 w-[75px] items-center justify-center gap-1 rounded-full bg-white text-xs font-black text-slate-950 transition hover:bg-slate-200 disabled:opacity-60"
                    >
                      <Edit3 size={13} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(restaurant.id)}
                      disabled={actionId === restaurant.id}
                      className="inline-flex h-9 w-[85px] items-center justify-center gap-1 rounded-full bg-red-500 text-xs font-black text-white transition hover:bg-red-400 disabled:opacity-60"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {editingRestaurant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Edit restaurant</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Update restaurant information shown to users.
                </p>
              </div>

              <button
                onClick={() => setEditingRestaurant(null)}
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                value={editForm.name}
                onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                placeholder="Restaurant name"
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
              />

              <input
                value={editForm.category}
                onChange={(event) => setEditForm({ ...editForm, category: event.target.value })}
                placeholder="Category"
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
              />

              <textarea
                value={editForm.description}
                onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                placeholder="Description"
                className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
              />

              <input
                value={editForm.address}
                onChange={(event) => setEditForm({ ...editForm, address: event.target.value })}
                placeholder="Address"
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={editForm.phone}
                  onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })}
                  placeholder="Phone"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
                />

                <input
                  value={editForm.openingHours}
                  onChange={(event) =>
                    setEditForm({ ...editForm, openingHours: event.target.value })
                  }
                  placeholder="Opening hours"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
                />
              </div>

              <input
                value={editForm.imageUrl}
                onChange={(event) => setEditForm({ ...editForm, imageUrl: event.target.value })}
                placeholder="Image URL"
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
              />

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingRestaurant(null)}
                  className="h-11 w-[110px] rounded-full bg-white/10 text-sm font-black text-white hover:bg-white/20"
                >
                  Cancel
                </button>

                <button
                  disabled={actionId === editingRestaurant.id}
                  className="inline-flex h-11 w-[140px] items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950 hover:bg-emerald-300 disabled:opacity-60"
                >
                  {actionId === editingRestaurant.id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
