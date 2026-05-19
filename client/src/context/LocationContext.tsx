import { createContext, useContext, useEffect, useState } from "react";

export type LocationInfo = {
  lat: number;
  lng: number;
  accuracy?: number;
  label: string;
  source: "REAL_BROWSER_LOCATION" | "DEMO_LOCATION";
};

type LocationContextValue = {
  locationInfo: LocationInfo | null;
  isGettingLocation: boolean;
  locationError: string;
  getCurrentLocation: () => Promise<LocationInfo | null>;
  setDemoLocation: (location: LocationInfo) => void;
  clearLocation: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

const STORAGE_KEY = "foodiefind_location";

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    const storedLocation = localStorage.getItem(STORAGE_KEY);

    if (!storedLocation) return;

    try {
      const parsed = JSON.parse(storedLocation) as LocationInfo;

      if (
        typeof parsed.lat === "number" &&
        typeof parsed.lng === "number" &&
        parsed.lat >= -90 &&
        parsed.lat <= 90 &&
        parsed.lng >= -180 &&
        parsed.lng <= 180
      ) {
        setLocationInfo(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function saveLocation(nextLocation: LocationInfo) {
    setLocationInfo(nextLocation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLocation));
  }

  async function getCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location access.");
      return null;
    }

    setIsGettingLocation(true);
    setLocationError("");

    return new Promise<LocationInfo | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation: LocationInfo = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            label: "Using your real browser location",
            source: "REAL_BROWSER_LOCATION",
          };

          saveLocation(nextLocation);
          setIsGettingLocation(false);
          resolve(nextLocation);
        },
        (error) => {
          setIsGettingLocation(false);

          if (error.code === error.PERMISSION_DENIED) {
            setLocationError("Location permission was denied. Allow location access in your browser.");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setLocationError("Your device/browser could not detect your location.");
          } else if (error.code === error.TIMEOUT) {
            setLocationError("Location detection timed out. Try again.");
          } else {
            setLocationError("Could not get your real location.");
          }

          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    });
  }

  function setDemoLocation(location: LocationInfo) {
    setLocationError("");
    saveLocation(location);
  }

  function clearLocation() {
    setLocationInfo(null);
    setLocationError("");
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <LocationContext.Provider
      value={{
        locationInfo,
        isGettingLocation,
        locationError,
        getCurrentLocation,
        setDemoLocation,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocationContext must be used inside LocationProvider");
  }

  return context;
}
