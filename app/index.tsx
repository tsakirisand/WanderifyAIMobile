import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../src/state/AuthProvider";
import { LoadingState } from "../src/components/NativeUI";

export default function IndexRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState label="Preparing your trip space…" />;
  return <Redirect href={user?.emailVerified ? "/(tabs)" : "/login"} />;
}
