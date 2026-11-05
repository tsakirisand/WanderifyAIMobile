import React, { useCallback } from "react";
import { RefreshControl, ScrollView, Text, TextInput, Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, AppButton, Card, Notice, ScreenTitle } from "../../src/components/NativeUI";
import { DestinationImage } from "../../src/components/DestinationImage";
import { destinations } from "../../src/data/trips";
import { useAuth } from "../../src/state/AuthProvider";
import { useTrips } from "../../src/state/TripProvider";
import { colors, ui } from "../../src/theme";
import { formatDateRange, tripEndDate, type Trip } from "../../src/types/trip";

function todayKey() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; }

export default function HomeScreen() {
  const { user } = useAuth(); const { trips, loading, refreshing, error, refresh } = useTrips(); const [search, setSearch] = React.useState("");
  const displayName = user?.displayName?.trim() || user?.email?.split("@")[0] || "traveler";
  const upcoming = [...trips].filter((trip) => (tripEndDate(trip) || "") >= todayKey()).sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""))[0];
  const startPlan = useCallback((destination = "") => router.push({ pathname: "/plan", params: destination ? { destination } : {} }), []);
  const visibleDestinations = destinations.filter((destination) => destination.name.toLowerCase().includes(search.trim().toLowerCase()));
  return <Screen scroll={false}>
    <ScrollView contentContainerStyle={[ui.page, { paddingTop: 15 }]} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refresh(true)} tintColor={colors.primary} />}>
      <View style={ui.between}><View style={ui.row}><View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}><Ionicons name="navigate" color="white" size={22} /></View><Text style={ui.heading}>Wanderify</Text></View><Text style={{ color: colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>YOUR TRIPS</Text></View>
      <ScreenTitle eyebrow={`Hey, ${displayName}`} title="Where to next?" subtitle="A little inspiration. A whole new adventure." />
      <View style={[ui.row, ui.input, { gap: 9 }]}><Ionicons name="search-outline" size={20} color={colors.muted} /><TextInput accessibilityLabel="Search destinations" placeholder="Search destinations…" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} onSubmitEditing={() => search.trim() && startPlan(search.trim())} returnKeyType="search" style={{ flex: 1, fontSize: 15, color: colors.ink }} /></View>
      <View style={{ gap: 13 }}><View style={ui.between}><Text style={ui.heading}>Discover destinations</Text><Pressable accessibilityRole="button" accessibilityLabel="Plan a trip to another destination" onPress={() => startPlan(search.trim())}><Text style={{ color: colors.primary, fontWeight: "800" }}>Explore</Text></Pressable></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 13 }}>
          {visibleDestinations.map((destination) => <Pressable key={destination.name} accessibilityRole="button" accessibilityLabel={`Plan a trip to ${destination.name}`} onPress={() => startPlan(destination.name)}><DestinationImage destination={destination.name} uri={destination.photo} style={{ width: 205, height: 218 }}><View style={{ flex: 1, justifyContent: "flex-end", padding: 14, backgroundColor: "#00000020" }}><View style={{ padding: 10, borderRadius: 12, backgroundColor: "#191526A6" }}><Text style={{ color: "white", fontSize: 23, fontWeight: "800" }}>{destination.name}</Text><Text style={{ color: "#FFFFFFE8" }}>{destination.country}</Text></View></View></DestinationImage></Pressable>)}
          {!visibleDestinations.length ? <Card style={{ width: 260, justifyContent: "center" }}><Text style={ui.muted}>No matching featured places.</Text><AppButton label={`Plan ${search}`} onPress={() => startPlan(search.trim())} secondary /></Card> : null}
        </ScrollView>
      </View>
      <View style={{ gap: 12 }}><Text style={ui.heading}>Your next escape</Text>
        {loading ? <Text style={ui.muted}>Loading your trips…</Text> : error ? <Card><Text style={ui.muted}>{error}</Text><AppButton label="Try again" onPress={() => refresh()} secondary /></Card> : upcoming ? <TripShortcut trip={upcoming} /> : <Card><Text style={ui.text}>Your next chapter starts here.</Text><Text style={ui.muted}>Create a trip to see your real itinerary here.</Text></Card>}
      </View>
      <AppButton label="Plan a trip" icon="add" onPress={() => startPlan()} />
      <Notice icon="lock-closed-outline">Your trips are private to your account. Checkout and itinerary generation are handled securely by Wanderify.</Notice>
    </ScrollView>
  </Screen>;
}

function TripShortcut({ trip }: { trip: Trip }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open ${trip.destination} itinerary`} onPress={() => router.push(`/trip/${trip.id}`)} style={[ui.card, ui.row]}>
    <DestinationImage destination={trip.destination} style={{ width: 82, height: 82 }} />
    <View style={{ flex: 1, gap: 4 }}><Text style={ui.heading}>{trip.destination}</Text><Text style={ui.muted}>{formatDateRange(trip)}</Text><Text style={ui.muted}>{trip.days} days · {trip.travelers}</Text></View><Ionicons name="chevron-forward" color={colors.primary} size={20} />
  </Pressable>;
}
