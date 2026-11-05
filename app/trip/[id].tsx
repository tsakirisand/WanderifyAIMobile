import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, Share, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { AppButton, Card, Chip, IconButton, Notice, Screen, ScreenTitle } from "../../src/components/NativeUI";
import { DestinationImage } from "../../src/components/DestinationImage";
import { MapPreview } from "../../src/components/MapPreview";
import { apiRequest } from "../../src/lib/api";
import { useAuth } from "../../src/state/AuthProvider";
import { useTrips } from "../../src/state/TripProvider";
import { colors, ui } from "../../src/theme";
import { formatDateRange, formatTripDate, type Trip, type TripActivity, type TripDay } from "../../src/types/trip";

type Weather = { temp: number; condition: string; humidity: number; wind: number; isHistorical: boolean; isFallback?: boolean; source: string; conditionIcon?: string };
const bands = ["morning", "afternoon", "evening"] as const;
const bandNames = { morning: "Morning", afternoon: "Afternoon", evening: "Evening" };
function dayDate(trip: Trip, index: number) { if (!trip.startDate) return ""; const date = new Date(`${trip.startDate}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + index); return date.toISOString().slice(0, 10); }
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!); }

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { user } = useAuth(); const { trips, refresh, remove } = useTrips();
  const [trip, setTrip] = useState<Trip | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [dayIndex, setDayIndex] = useState(0); const [expanded, setExpanded] = useState<string | null>(null); const [weather, setWeather] = useState<Weather | null>(null); const [weatherBusy, setWeatherBusy] = useState(false); const [exporting, setExporting] = useState(false);
  const listTrip = trips.find((item) => item.id === id);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user || !id) return;
      try {
        const response = await apiRequest<{ trip: Trip }>(user, `/api/mobile/trips/${encodeURIComponent(id)}`);
        if (active) { setTrip(response.trip); setError(""); }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "This trip could not be loaded.");
      } finally { if (active) setLoading(false); }
    }
    void load();
    if (listTrip?.isGenerating) {
      const timer = setInterval(() => { void load(); }, 5000);
      return () => { active = false; clearInterval(timer); };
    }
    return () => { active = false; };
  }, [user, id, listTrip?.isGenerating]);

  useEffect(() => {
    let active = true;
    async function loadWeather() {
      if (!user || !trip?.startDate) return;
      setWeatherBusy(true); setWeather(null);
      try {
        const response = await apiRequest<{ weather: Weather | null }>(user, `/api/mobile/weather?destination=${encodeURIComponent(trip.destination)}&date=${dayDate(trip, dayIndex)}`);
        if (active) setWeather(response.weather);
      } catch { if (active) setWeather(null); }
      finally { if (active) setWeatherBusy(false); }
    }
    void loadWeather();
    return () => { active = false; };
  }, [user, trip?.id, trip?.startDate, trip?.destination, dayIndex]);

  const day = trip?.aiResult?.days?.find((item) => item.day === dayIndex + 1) || trip?.aiResult?.days?.[dayIndex];
  const activities = useMemo(() => day ? bands.flatMap((band) => (day[band] || []).map((activity) => ({ ...activity, band }))) : [], [day]);
  const points = useMemo(() => activities.map(({ place }) => trip?.coordinates?.[place]).filter((point): point is { lat: number; lon: number } => !!point && Number.isFinite(point.lat) && Number.isFinite(point.lon)), [activities, trip?.coordinates]);

  async function openMaps(activity?: TripActivity) {
    const location = activity?.place || trip?.destination || "";
    const coordinate = activity ? trip?.coordinates?.[activity.place] : undefined;
    const query = coordinate ? `${coordinate.lat},${coordinate.lon}` : location;
    await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
  }
  async function sharePdf() {
    if (!trip?.aiResult) return;
    setExporting(true);
    try {
      const itinerary = trip.aiResult.days.map((tripDay) => `<section><h2>Day ${tripDay.day}</h2>${bands.map((band) => `<h3>${bandNames[band]}</h3><ul>${(tripDay[band] || []).map((item) => `<li><strong>${escapeHtml(item.time || "")}${item.time ? " · " : ""}${escapeHtml(item.place)}</strong><p>${escapeHtml(item.description)}</p></li>`).join("")}</ul>`).join("")}<p><strong>Tips:</strong> ${escapeHtml((tripDay.tips || []).join(" · "))}</p></section>`).join("");
      const html = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:-apple-system,Arial,sans-serif;color:#191526;padding:24px}h1{color:#7C3AED}h2{margin-top:28px;border-bottom:1px solid #eee;padding-bottom:8px}h3{color:#7C3AED}li{margin:10px 0}p{line-height:1.5;color:#5b5665}.note{background:#f3edff;padding:12px;border-radius:12px}</style></head><body><h1>${escapeHtml(trip.destination)} itinerary</h1><p>${escapeHtml(formatDateRange(trip))} · ${trip.days} days · ${escapeHtml(trip.travelers)}</p><p>${escapeHtml(trip.aiResult.summary || "")}</p><div class="note">AI generated suggestions. Verify opening times, prices and availability before your trip.</div>${itinerary}</body></html>`;
      const result = await Print.printToFileAsync({ html, base64: false });
      const available = await Sharing.isAvailableAsync();
      if (available) await Sharing.shareAsync(result.uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: `${trip.destination} itinerary` });
      else Alert.alert("PDF ready", `Saved itinerary PDF: ${result.uri}`);
    } catch { Alert.alert("PDF export failed", "Please try again."); }
    finally { setExporting(false); }
  }
  function confirmDelete() {
    if (!trip) return;
    Alert.alert("Delete this trip?", `This removes the ${trip.destination} itinerary from your account.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { try { await remove(trip.id); router.replace("/trips"); } catch (reason) { Alert.alert("Could not delete", reason instanceof Error ? reason.message : "Please try again."); } } },
    ]);
  }

  if (loading) return <Screen scroll={false}><View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={colors.primary} /><Text style={[ui.muted, { marginTop: 12 }]}>Loading itinerary…</Text></View></Screen>;
  if (error || !trip) return <Screen><ScreenTitle title="Trip unavailable" subtitle={error || "This trip may have been removed."} /><AppButton label="Back to My Trips" onPress={() => router.replace("/trips")} icon="arrow-back" /></Screen>;
  if (!trip.aiResult) return <Screen><IconButton label="Back" icon="arrow-back" onPress={() => router.back()} /><DestinationImage destination={trip.destination} style={{ height: 230 }}><View style={{ flex: 1, justifyContent: "flex-end", padding: 20, backgroundColor: "#00000025" }}><Text style={{ color: "white", fontSize: 30, fontWeight: "900" }}>{trip.destination}</Text><Text style={{ color: "white" }}>{formatDateRange(trip)}</Text></View></DestinationImage><ScreenTitle title={trip.isGenerating ? "Your itinerary is being prepared" : "Itinerary not ready yet"} subtitle="Your payment and trip are saved securely. This screen will update when the itinerary is available." /><ActivityIndicator color={colors.primary} /><AppButton label="Refresh trip" icon="refresh" onPress={() => { setLoading(true); void refresh(true); }} secondary /></Screen>;

  const selectedDate = dayDate(trip, dayIndex);
  return <Screen scroll={false}>
    <ScrollView contentContainerStyle={[ui.page, { paddingTop: 0 }]}>
      <DestinationImage destination={trip.destination} style={{ height: 275, marginHorizontal: -20, marginTop: -1, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <View style={{ flex: 1, padding: 17, justifyContent: "space-between", backgroundColor: "#17142138" }}>
          <View style={ui.between}><IconButton label="Back to trips" icon="arrow-back" onPress={() => router.back()} /><View style={{ flexDirection: "row", gap: 8 }}><IconButton label="Edit itinerary" icon="create-outline" onPress={() => router.push(`/trip/${trip.id}/edit`)} /><IconButton label="Delete trip" icon="trash-outline" danger onPress={confirmDelete} /></View></View>
          <View style={{ backgroundColor: "#191526B0", borderRadius: 17, padding: 14, gap: 5 }}><Text style={{ color: "white", fontSize: 28, fontWeight: "900" }}>{trip.destination}</Text><Text style={{ color: "white" }}>{formatDateRange(trip)}</Text><Text style={{ color: "white" }}>{trip.days} days · {trip.travelers} · {trip.budget}</Text></View>
        </View>
      </DestinationImage>
      <View style={ui.between}><ScreenTitle title="Your itinerary" subtitle="AI-generated suggestions · verify details before booking." /><IconButton label="Share itinerary PDF" icon="share-outline" onPress={sharePdf} /></View>
      <AppButton label={exporting ? "Preparing PDF…" : "Export and share PDF"} icon="document-text-outline" secondary loading={exporting} onPress={sharePdf} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {trip.aiResult.days.map((item, index) => <Chip key={item.day} label={`Day ${item.day}`} selected={dayIndex === index} onPress={() => { setDayIndex(index); setExpanded(null); }} />)}
      </ScrollView>
      {weatherBusy ? <Card style={[ui.row, { alignItems: "center" }]}><ActivityIndicator color={colors.primary} /><Text style={ui.muted}>Loading weather…</Text></Card> : weather ? <Card style={[ui.row, { justifyContent: "space-between" }]}><View style={ui.row}><Ionicons name="partly-sunny-outline" color={colors.primary} size={22} /><View><Text style={[ui.text, { fontWeight: "800" }]}>{weather.condition} · {weather.temp}°C</Text><Text style={ui.muted}>{weather.humidity}% humidity · {weather.wind} km/h wind</Text></View></View><Text style={{ maxWidth: 120, color: colors.muted, fontSize: 10, textAlign: "right" }}>{weather.isHistorical ? "Historical · same date last year" : weather.isFallback ? "Current forecast · date unavailable" : `Forecast · ${formatTripDate(selectedDate)}`}</Text></Card> : <Text style={ui.muted}>Weather data is unavailable for this date.</Text>}
      <View style={ui.between}><Text style={ui.heading}>Day {day?.day || dayIndex + 1} · {formatTripDate(selectedDate)}</Text><Text style={{ fontSize: 11, color: colors.primary, fontWeight: "800" }}>ROUTE PREVIEW</Text></View>
      {points.length ? <MapPreview destination={trip.destination} points={points} places={activities.map((activity) => activity.place)} /> : <Card style={{ gap: 8 }}><Text style={ui.heading}>Route map unavailable</Text><Text style={ui.muted}>No verified place coordinates are available for these activities.</Text><AppButton label="Open destination in Maps" icon="map-outline" onPress={() => openMaps()} secondary /></Card>}
      {activities.map(({ time, place, description, band }, index) => {
        const key = `${dayIndex}-${band}-${index}`; const open = expanded === key;
        return <Pressable key={key} accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setExpanded(open ? null : key)} style={ui.card}>
          <View style={ui.row}><View style={{ minWidth: 61, paddingVertical: 8, paddingHorizontal: 9, borderRadius: 10, backgroundColor: colors.pale, alignItems: "center" }}><Text style={{ color: colors.primary, fontSize: 12, fontWeight: "800" }}>{time || bandNames[band]}</Text></View><View style={{ flex: 1, gap: 4 }}><Text style={[ui.text, { fontWeight: "800" }]}>{place}</Text><Text style={ui.muted} numberOfLines={open ? undefined : 2}>{description}</Text></View><Ionicons name={open ? "chevron-up" : "chevron-down"} color={colors.muted} size={19} /></View>
          {open ? <View style={{ flexDirection: "row", justifyContent: "flex-end", borderTopWidth: 1, borderColor: colors.line, paddingTop: 8 }}><Pressable accessibilityRole="button" accessibilityLabel={`Open ${place} in Maps`} onPress={() => openMaps({ place, description })} style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 42, paddingHorizontal: 8 }}><Ionicons name="navigate-outline" color={colors.primary} /><Text style={{ color: colors.primary, fontWeight: "800" }}>Directions</Text></Pressable></View> : null}
        </Pressable>;
      })}
      {(day?.tips?.length || 0) > 0 ? <Card><Text style={ui.heading}>Local tips</Text>{day?.tips?.map((tip, index) => <Text key={index} style={ui.text}>• {tip}</Text>)}</Card> : null}
      {trip.aiResult.hotel_recommendations?.length ? <SuggestionCard title="Hotel ideas" items={trip.aiResult.hotel_recommendations.map((item) => `${item.name} · ${item.price_range}: ${item.description}`)} /> : null}
      {trip.aiResult.food_recommendations?.length ? <SuggestionCard title="Food ideas" items={trip.aiResult.food_recommendations.map((item) => `${item.name}: ${item.description}`)} /> : null}
      {trip.aiResult.hidden_gems?.length ? <SuggestionCard title="Hidden gems" items={trip.aiResult.hidden_gems} /> : null}
      {trip.aiResult.flight_suggestions?.length ? <Notice icon="airplane-outline">Flight estimates are AI-generated and not live fares or booking options.</Notice> : null}
      <Notice>Activities, hotel ideas, food ideas and tips are AI-generated suggestions, not verified availability, reviews or bookings.</Notice>
    </ScrollView>
  </Screen>;
}

function SuggestionCard({ title, items }: { title: string; items: string[] }) {
  return <Card><Text style={ui.heading}>{title}</Text>{items.map((item, index) => <View key={index} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}><Ionicons name="ellipse" size={7} color={colors.primary} style={{ marginTop: 7 }} /><Text style={[ui.text, { flex: 1 }]}>{item}</Text></View>)}</Card>;
}
