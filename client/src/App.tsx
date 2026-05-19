import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import { NearbySearchProvider } from "./context/NearbySearchContext";
import { AdminPage } from "./pages/AdminPage";
import { AdminReviewsPage } from "./pages/AdminReviewsPage";
import { ExplorePage } from "./pages/ExplorePage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { LoginPage } from "./pages/LoginPage";
import { NearbyPlacesPage } from "./pages/NearbyPlacesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { RestaurantDetailsPage } from "./pages/RestaurantDetailsPage";

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <NearbySearchProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ExplorePage />} />
              <Route path="/nearby" element={<NearbyPlacesPage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/reviews" element={<AdminReviewsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </BrowserRouter>
        </NearbySearchProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
