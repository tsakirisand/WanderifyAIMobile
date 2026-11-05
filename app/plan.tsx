import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import { AppButton, Card, Chip, IconButton, Input, Notice, Screen } from "../src/components/NativeUI";
import { apiRequest } from "../src/lib/api";
import { useAuth } from "../src/state/AuthProvider";
import { useTrips } from "../src/state/TripProvider";
import { colors, ui } from "../src/theme";
import type { TripConfig } from "../src/types/trip";

const budgets = ["budget-0-500", "economy-500-1000", "moderate-1000-2000", "premium-2000-3500", "luxury-3500-5000", "ultra-5000+"];
const budgetNames = ["Budget", "Economy", "Moderate", "Premium", "Luxury", "Ultra luxury"];
const styles = ["relax", "adventure", "cultural", "foodie", "nightlife", "romantic"];
const styleNames = ["Relaxation", "Adventure", "Cultural", "Foodie", "Nightlife", "Romantic"];
const interests = ["Food & Dining", "Museums & History", "Nature & Parks", "Nightlife", "Shopping", "Art & Culture", "Adventure Sports", "Wellness & Spa"];
function defaultStartDate() { const date = new Date(); date.setDate(date.getDate() + 30); return date.toISOString().slice(0, 10); }
function isIsoDate(value: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const date = new Date(`${value}T12:00:00Z`); return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value; }

export default function PlanScreen() {
  const { destination: initialDestination } = useLocalSearchParams<{ destination?: string }>();
  const { user } = useAuth(); const { refresh } = useTrips();
  const [step, setStep] = useState(0); const [destination, setDestination] = useState(initialDestination || "");
  const [startDate, setStartDate] = useState(defaultStartDate()); const [days, setDays] = useState(5); const [travelers, setTravelers] = useState<TripConfig["travelers"]>("solo");
  const [budget, setBudget] = useState("moderate-1000-2000"); const [travelStyle, setTravelStyle] = useState("cultural"); const [selectedInterests, setSelectedInterests] = useState<string[]>([]); const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false); const [checkoutUrl, setCheckoutUrl] = useState(""); const [checkoutSessionId, setCheckoutSessionId] = useState(""); const [status, setStatus] = useState("");
  const checkoutRef = useRef(""); const requestRef = useRef(""); const verifyingRef = useRef(false);

  useEffect(() => { if (typeof initialDestination === "string" && initialDestination) setDestination(initialDestination); }, [initialDestination]);
  async function verifyPayment() {
    if (!user || !checkoutRef.current || verifyingRef.current) return;
    verifyingRef.current = true; setBusy(true); setStatus("Checking payment securely…");
    try {
      for (let attempt = 0; attempt < 4; attempt++) {
        const result = await apiRequest<{ status: "complete" | "in_progress" | "unpaid"; tripId?: string }>(user, "/api/mobile/checkout/verify", { method: "POST", body: JSON.stringify({ sessionId: checkoutRef.current }) }, 120_000);
        if (result.status === "complete" && result.tripId) {
          await refresh(true);
          router.replace(`/trip/${result.tripId}`);
          return;
        }
        if (result.status === "unpaid") {
          setStatus("Payment is not confirmed yet. Return to checkout to complete it, or cancel to leave this trip unsaved.");
          break;
        }
        setStatus("Payment confirmed. Your itinerary is still being prepared…");
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1800));
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Payment verification is temporarily unavailable. Try again.");
    } finally { verifyingRef.current = false; setBusy(false); }
  }

  useEffect(() => {
    let previous = AppState.currentState;
    const subscription = AppState.addEventListener("change", (next) => {
      if (previous.match(/inactive|background/) && next === "active" && checkoutRef.current) void verifyPayment();
      previous = next;
    });
    return () => subscription.remove();
  }, [user]);

  const validBasics = destination.trim().length >= 2 && isIsoDate(startDate) && days >= 1 && days <= 14;
  function continueStep() {
    if (step === 0 && !validBasics) return Alert.alert("Trip details needed", "Enter a destination, a valid start date (YYYY-MM-DD), and choose 1 to 14 days.");
    if (step < 2) setStep((current) => current + 1);
  }
  function toggleInterest(value: string) { setSelectedInterests((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]); }

  async function startCheckout() {
    if (!user || busy) return;
    const config: TripConfig = { destination: destination.trim(), days, budget, travelStyle, travelers, interests: selectedInterests, notes: notes.trim(), startDate };
    setBusy(true); setStatus("");
    try {
      if (!requestRef.current) requestRef.current = Crypto.randomUUID();
      if (!checkoutUrl) {
        const created = await apiRequest<{ checkoutUrl: string; sessionId: string }>(user, "/api/mobile/checkout", { method: "POST", body: JSON.stringify({ requestId: requestRef.current, trip: config }) }, 30_000);
        checkoutRef.current = created.sessionId; setCheckoutSessionId(created.sessionId); setCheckoutUrl(created.checkoutUrl);
        await WebBrowser.openBrowserAsync(created.checkoutUrl, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET });
      } else {
        await WebBrowser.openBrowserAsync(checkoutUrl, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET });
      }
      setStatus("When you return, Wanderify will verify payment with Stripe.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Secure checkout could not be opened. Please retry.");
    } finally { setBusy(false); }
  }

  return <Screen scroll={false}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[ui.between, { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }]}><IconButton label="Close planner" icon="arrow-back" onPress={() => router.back()} /><Text style={ui.heading}>Plan your trip</Text><Text style={{ color: colors.primary, fontWeight: "800" }}>{step + 1} of 3</Text></View>
      <View style={{ flexDirection: "row", gap: 6, paddingHorizontal: 20, paddingBottom: 14 }}>{[0, 1, 2].map((index) => <View key={index} style={{ flex: 1, height: 5, borderRadius: 4, backgroundColor: index <= step ? colors.primary : colors.line }} />)}</View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[ui.page, { paddingTop: 10 }]}>
        <View style={{ gap: 6 }}><Text style={ui.title}>{["Start with the basics", "Make it yours", "Review your trip"][step]}</Text><Text style={ui.muted}>{["Where you’re going and when.", "Choose your pace and the things you love.", "Your itinerary is generated after secure checkout."][step]}</Text></View>
        {step === 0 ? <>
          <Input label="Destination" value={destination} onChangeText={setDestination} placeholder="City or country" maxLength={100} returnKeyType="next" />
          <Input label="Start date · YYYY-MM-DD" value={startDate} onChangeText={setStartDate} placeholder="2026-12-05" autoCapitalize="none" maxLength={10} />
          <Card><Text style={ui.label}>Trip duration</Text><View style={ui.between}><Text style={ui.text}>{days} {days === 1 ? "day" : "days"}</Text><View style={ui.row}><IconButton label="Remove one day" icon="remove" onPress={() => setDays((value) => Math.max(1, value - 1))} /><IconButton label="Add one day" icon="add" onPress={() => setDays((value) => Math.min(14, value + 1))} /></View></View></Card>
          <View style={{ gap: 10 }}><Text style={ui.label}>Who’s travelling?</Text><View style={[ui.row, { flexWrap: "wrap" }]}>{(["solo", "couple", "family", "friends"] as const).map((value) => <Chip key={value} label={value[0].toUpperCase() + value.slice(1)} selected={travelers === value} onPress={() => setTravelers(value)} />)}</View></View>
        </> : null}
        {step === 1 ? <>
          <View style={{ gap: 10 }}><Text style={ui.label}>Budget</Text><View style={[ui.row, { flexWrap: "wrap" }]}>{budgets.map((value, index) => <Chip key={value} label={budgetNames[index]} selected={budget === value} onPress={() => setBudget(value)} />)}</View></View>
          <View style={{ gap: 10 }}><Text style={ui.label}>Travel style</Text><View style={[ui.row, { flexWrap: "wrap" }]}>{styles.map((value, index) => <Chip key={value} label={styleNames[index]} selected={travelStyle === value} onPress={() => setTravelStyle(value)} />)}</View></View>
          <View style={{ gap: 10 }}><Text style={ui.label}>Interests · choose any</Text><View style={[ui.row, { flexWrap: "wrap" }]}>{interests.map((value) => <Chip key={value} label={value} selected={selectedInterests.includes(value)} onPress={() => toggleInterest(value)} />)}</View></View>
        </> : null}
        {step === 2 ? <>
          <Card><Text style={ui.heading}>{destination.trim() || "Your destination"}</Text><Text style={ui.text}>{startDate} · {days} days · {travelers}</Text><Text style={ui.muted}>{budgetNames[budgets.indexOf(budget)]} · {styleNames[styles.indexOf(travelStyle)]}</Text><Text style={ui.muted}>{selectedInterests.join(" · ") || "No interests selected"}</Text><View style={{ borderTopWidth: 1, borderColor: colors.line, paddingTop: 12, marginTop: 3 }}><Text style={ui.heading}>One-time itinerary price · $1.99 USD</Text><Text style={ui.muted}>The price is fixed on the server and charged by Stripe Checkout.</Text></View></Card>
          <Input label="Extra preferences" value={notes} onChangeText={setNotes} multiline maxLength={400} placeholder="Slow mornings, vegetarian food, hidden gems…" />
          <Notice icon="shield-checkmark-outline">Payment status and account ownership are verified by Wanderify’s server. You can cancel on the Stripe checkout page.</Notice>
          {status ? <Text accessibilityRole="alert" style={{ color: status.startsWith("Payment is not") ? colors.danger : colors.primary, lineHeight: 21 }}>{status}</Text> : null}
          {checkoutSessionId && status.startsWith("Payment is not") ? <AppButton label="Return to secure checkout" icon="card-outline" onPress={startCheckout} loading={busy} secondary /> : null}
          {checkoutSessionId && !status.startsWith("Payment is not") ? <AppButton label="I’ve returned — verify payment" icon="checkmark-circle-outline" onPress={verifyPayment} loading={busy} secondary /> : null}
        </> : null}
        {step < 2 ? <AppButton label="Continue" icon="arrow-forward" onPress={continueStep} /> : <AppButton label="Continue to secure checkout · $1.99" icon="lock-closed-outline" onPress={startCheckout} loading={busy} disabled={!user} />}
        {step > 0 ? <AppButton label="Back" icon="arrow-back" onPress={() => setStep((current) => current - 1)} secondary disabled={busy} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  </Screen>;
}
