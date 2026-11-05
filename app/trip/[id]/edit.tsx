import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppButton, IconButton, Screen, ScreenTitle } from "../../../src/components/NativeUI";
import { apiRequest } from "../../../src/lib/api";
import { useAuth } from "../../../src/state/AuthProvider";
import { colors, ui } from "../../../src/theme";
import type { Trip } from "../../../src/types/trip";

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null); const [json, setJson] = useState(""); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!user || !id) return () => { active = false; };
    apiRequest<{ trip: Trip }>(user, `/api/mobile/trips/${encodeURIComponent(id)}`)
      .then(({ trip: loaded }) => { if (active) { setTrip(loaded); setJson(JSON.stringify(loaded.aiResult, null, 2)); } })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load itinerary."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user, id]);

  async function save() {
    if (!user || !trip) return;
    let aiResult: unknown;
    try { aiResult = JSON.parse(json); }
    catch { setError("The itinerary is not valid JSON. Correct it before saving."); return; }
    setError(""); setSaving(true);
    try { await apiRequest(user, `/api/mobile/trips/${encodeURIComponent(trip.id)}`, { method: "PATCH", body: JSON.stringify({ aiResult }) }); router.back(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The itinerary could not be saved."); }
    finally { setSaving(false); }
  }

  return <Screen scroll={false}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[ui.between, { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 15 }]}><IconButton label="Cancel editing" icon="close" onPress={() => router.back()} /><Text style={ui.heading}>Edit itinerary</Text><View style={{ width: 46 }} /></View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}><ScreenTitle title={trip ? trip.destination : "Trip itinerary"} subtitle="Edit the itinerary JSON. The server validates the structure and ownership before saving." /></View>
      {loading ? <Text style={[ui.muted, { padding: 20 }]}>Loading itinerary…</Text> : <TextInput accessibilityLabel="Itinerary JSON editor" multiline value={json} onChangeText={setJson} autoCapitalize="none" autoCorrect={false} spellCheck={false} textAlignVertical="top" style={{ flex: 1, marginHorizontal: 20, marginBottom: 12, padding: 15, borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: "white", color: colors.ink, fontSize: 12, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }} />}
      {error ? <Text accessibilityRole="alert" style={{ color: colors.danger, paddingHorizontal: 20, paddingBottom: 8 }}>{error}</Text> : null}
      <View style={{ padding: 20 }}><AppButton label="Save itinerary" icon="checkmark" onPress={save} loading={saving} disabled={loading || !trip} /></View>
    </KeyboardAvoidingView>
  </Screen>;
}
