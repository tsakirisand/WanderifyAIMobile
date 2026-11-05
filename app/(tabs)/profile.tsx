import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { router } from "expo-router";
import { signOut, updateProfile } from "firebase/auth";
import { AppButton, Card, Icon, Input, Notice, Screen, ScreenTitle } from "../../src/components/NativeUI";
import { auth } from "../../src/lib/firebase";
import { useAuth } from "../../src/state/AuthProvider";
import { useTrips } from "../../src/state/TripProvider";
import { colors, ui } from "../../src/theme";

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth(); const { trips } = useTrips();
  const [draft, setDraft] = useState(user?.displayName || ""); const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(user?.displayName || ""), [user?.displayName]);
  async function saveName() {
    if (!user || !draft.trim()) return;
    setSaving(true);
    try { await updateProfile(user, { displayName: draft.trim() }); await refreshUser(); Alert.alert("Profile updated", "Your name now appears in Wanderify."); }
    catch { Alert.alert("Could not update name", "Please check your connection and try again."); }
    finally { setSaving(false); }
  }
  function logout() {
    Alert.alert("Sign out?", "You can sign in again to see your saved trips.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: async () => { if (auth) await signOut(auth); router.replace("/login"); } },
    ]);
  }
  const name = user?.displayName?.trim() || user?.email?.split("@")[0] || "Traveler";
  return <Screen>
    <ScreenTitle title="Profile" subtitle="Your account and travel preferences." />
    <Card style={{ alignItems: "center", paddingVertical: 27 }}>
      <View style={{ width: 82, height: 82, borderRadius: 28, backgroundColor: colors.pale, alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 34, fontWeight: "900", color: colors.primary }}>{name.slice(0, 1).toUpperCase()}</Text></View>
      <Text style={ui.heading}>{name}</Text><Text style={ui.muted}>{user?.email}</Text>
      <View style={[ui.row, { marginTop: 7 }]}><Icon name={user?.emailVerified ? "checkmark-circle" : "alert-circle-outline"} color={user?.emailVerified ? colors.success : colors.danger} /><Text style={ui.text}>{user?.emailVerified ? "Email verified" : "Email not verified"}</Text></View>
    </Card>
    <Card>
      <Text style={ui.heading}>Your Wanderify</Text>
      <View style={[ui.row, { paddingVertical: 6 }]}><Icon name="briefcase-outline" color={colors.primary} /><Text style={ui.text}>{trips.length} saved {trips.length === 1 ? "trip" : "trips"}</Text></View>
      <Input label="Display name" value={draft} onChangeText={setDraft} maxLength={60} placeholder="Your name" />
      <AppButton label="Update display name" onPress={saveName} icon="checkmark" loading={saving} disabled={!draft.trim() || draft.trim() === (user?.displayName || "")} />
    </Card>
    <Notice icon="shield-checkmark-outline">Account sign-in, trip storage and payment verification use Firebase and Wanderify’s backend. Your session stays on this device.</Notice>
    <AppButton label="Sign out" secondary icon="log-out-outline" onPress={logout} />
  </Screen>;
}
