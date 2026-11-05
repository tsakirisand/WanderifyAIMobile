import React, { useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppButton, Card, Chip, EmptyState, Screen, ScreenTitle } from "../../src/components/NativeUI";
import { DestinationImage } from "../../src/components/DestinationImage";
import { useTrips } from "../../src/state/TripProvider";
import { colors, ui } from "../../src/theme";
import { formatDateRange, tripEndDate, type Trip } from "../../src/types/trip";

function todayKey() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; }

export default function TripsScreen() {
  const { trips, loading, refreshing, error, refresh, remove } = useTrips();
  const [filter, setFilter] = useState<"Upcoming" | "Past">("Upcoming");
  const today = todayKey();
  const visible = trips.filter((trip) => filter === "Upcoming" ? (tripEndDate(trip) || "") >= today : (tripEndDate(trip) || "") < today)
    .sort((a, b) => filter === "Upcoming" ? (a.startDate || "").localeCompare(b.startDate || "") : (b.startDate || "").localeCompare(a.startDate || ""));
  function confirmDelete(trip: Trip) {
    Alert.alert("Delete this trip?", `Remove the ${trip.destination} itinerary from your account?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove(trip.id).catch((reason) => Alert.alert("Could not delete", reason instanceof Error ? reason.message : "Please try again.")) },
    ]);
  }
  return <Screen scroll={false}><ScrollView contentContainerStyle={[ui.page, { paddingTop: 18 }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refresh(true)} tintColor={colors.primary} />}>
    <ScreenTitle title="My trips" subtitle="Your journeys, all in one place." />
    <View style={{ flexDirection: "row", gap: 8 }}>{(["Upcoming", "Past"] as const).map((value) => <View key={value} style={{ flex: 1 }}><Chip label={value} selected={filter === value} onPress={() => setFilter(value)} /></View>)}</View>
    {error ? <Card><Text style={ui.muted}>{error}</Text><AppButton label="Try again" onPress={() => refresh()} secondary /></Card> : null}
    {loading ? <Text style={ui.muted}>Loading your trips…</Text> : visible.map((trip) => <TripCard key={trip.id} trip={trip} onDelete={() => confirmDelete(trip)} />)}
    {!loading && !error && !visible.length ? <EmptyState title={`No ${filter.toLowerCase()} trips`} body="Start planning your next adventure and your saved itineraries will appear here." action={<AppButton label="Plan a trip" icon="add" onPress={() => router.push("/plan")} />} /> : null}
  </ScrollView></Screen>;
}

function TripCard({ trip, onDelete }: { trip: Trip; onDelete: () => void }) {
  return <Card style={{ padding: 0, overflow: "hidden", gap: 0 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${trip.destination} itinerary`} onPress={() => router.push(`/trip/${trip.id}`)}>
      <DestinationImage destination={trip.destination} style={{ height: 190, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <View style={{ flex: 1, padding: 15, justifyContent: "space-between", backgroundColor: "#00000015" }}>
          <Text style={{ alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: "white", color: colors.primary, fontWeight: "800", fontSize: 11 }}>ITINERARY</Text>
          <View style={{ padding: 11, borderRadius: 13, backgroundColor: "#191526A6" }}><Text style={{ fontSize: 26, fontWeight: "900", color: "white" }}>{trip.destination}</Text><Text style={{ color: "white", marginTop: 4 }}>{formatDateRange(trip)}</Text></View>
        </View>
      </DestinationImage>
    </Pressable>
    <View style={[ui.between, { padding: 15 }]}>
      <View style={{ flex: 1, gap: 5 }}><Text style={{ color: colors.primary, fontWeight: "800" }}>View itinerary</Text><Text style={ui.muted}>{trip.days} days · {trip.travelers} · {trip.budget}</Text></View>
      {trip.isGenerating ? <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>Creating…</Text> : null}
      <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${trip.destination} trip`} onPress={onDelete} style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}><Ionicons name="trash-outline" size={20} color={colors.muted} /></Pressable>
    </View>
  </Card>;
}
