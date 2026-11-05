import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { apiRequest } from "../lib/api";
import type { Trip } from "../types/trip";

type TripsState = {
  trips: Trip[];
  loading: boolean;
  refreshing: boolean;
  error: string;
  refresh: (quiet?: boolean) => Promise<void>;
  remove: (tripId: string) => Promise<void>;
};
const TripsContext = createContext<TripsState | null>(null);

export function TripProvider({ children }: React.PropsWithChildren) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async (quiet = false) => {
    if (!user || !user.emailVerified) { setTrips([]); setLoading(false); return; }
    if (quiet) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const payload = await apiRequest<{ trips: Trip[] }>(user, "/api/mobile/trips");
      setTrips(payload.trips);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Trips could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const remove = useCallback(async (tripId: string) => {
    if (!user) return;
    await apiRequest(user, `/api/mobile/trips/${encodeURIComponent(tripId)}`, { method: "DELETE" });
    setTrips((current) => current.filter((trip) => trip.id !== tripId));
  }, [user]);

  const value = useMemo(() => ({ trips, loading, refreshing, error, refresh, remove }), [trips, loading, refreshing, error, refresh, remove]);
  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}

export function useTrips() {
  const value = useContext(TripsContext);
  if (!value) throw new Error("useTrips must be used inside TripProvider");
  return value;
}
