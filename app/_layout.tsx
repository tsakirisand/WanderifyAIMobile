import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/state/AuthProvider";
import { TripProvider } from "../src/state/TripProvider";
import { colors } from "../src/theme";

function NavigationGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    const allowed = !!user?.emailVerified;
    if (allowed && inAuth) router.replace("/");
    else if (!allowed && !inAuth) router.replace("/login");
  }, [user, loading, segments, router]);
  return null;
}

export default function RootLayout() {
  return <SafeAreaProvider>
    <AuthProvider>
      <TripProvider>
        <StatusBar style="dark" />
        <NavigationGuard />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: "fade_from_bottom" }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="plan" options={{ presentation: "card" }} />
          <Stack.Screen name="trip/[id]" options={{ presentation: "card" }} />
          <Stack.Screen name="trip/[id]/edit" options={{ presentation: "modal" }} />
        </Stack>
      </TripProvider>
    </AuthProvider>
  </SafeAreaProvider>;
}
