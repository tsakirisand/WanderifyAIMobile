import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { reload, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { AppButton, Card, FormFeedback, Icon, Input, Notice, Screen } from "../../src/components/NativeUI";
import { auth, firebaseConfigured } from "../../src/lib/firebase";
import { authErrorMessage } from "../../src/lib/auth-errors";
import { colors, ui } from "../../src/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; message: string } | null>(null);
  async function login() {
    setFeedback(null);
    if (!auth) return setFeedback({ tone: "error", message: "Firebase is not configured. Check mobile/.env and restart Expo with --clear." });
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await reload(credential.user);
      if (!credential.user.emailVerified) {
        await signOut(auth);
        return setFeedback({ tone: "error", message: "Verify your email using the link in your inbox, then sign in again." });
      }
      router.replace("/(tabs)");
    } catch (error) {
      setFeedback({ tone: "error", message: authErrorMessage(error, "sign in") });
    } finally { setLoading(false); }
  }
  return <Screen>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ gap: 22 }}>
      <View style={{ alignItems: "center", gap: 12, paddingTop: 15 }}>
        <View style={{ width: 62, height: 62, borderRadius: 22, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}><Icon name="navigate" color="white" size={28} /></View>
        <Text style={[ui.title, { fontSize: 32 }]}>Welcome to Wanderify</Text>
        <Text style={[ui.muted, { textAlign: "center" }]}>Sign in to find your next adventure.</Text>
      </View>
      {!firebaseConfigured ? <Notice>Set up Firebase client values in the mobile/.env file before signing in.</Notice> : null}
      <Card>
        <Input label="Email address" accessibilityLabel="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="you@example.com" />
        <Input label="Password" accessibilityLabel="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" placeholder="Your password" />
        <Link href="/forgot-password" style={{ color: colors.primary, fontWeight: "700", alignSelf: "flex-end", paddingVertical: 6 }}>Forgot password?</Link>
        <AppButton label="Sign in" onPress={login} icon="arrow-forward" loading={loading} disabled={!email.trim() || !password || !firebaseConfigured} />
      </Card>
      {feedback ? <FormFeedback tone={feedback.tone}>{feedback.message}</FormFeedback> : null}
      {!firebaseConfigured ? <FormFeedback tone="error">Firebase settings are missing. Save them in mobile/.env, then stop and restart Expo.</FormFeedback> : !email.trim() || !password ? <Text style={[ui.muted, { textAlign: "center" }]}>Enter your email and password to enable Sign in.</Text> : null}
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 5 }}><Text style={ui.muted}>New to Wanderify?</Text><Link href="/signup" style={{ color: colors.primary, fontWeight: "800" }}>Create account</Link></View>
      <Text style={[ui.muted, { textAlign: "center", fontSize: 12 }]}>Your travel data is available only after you sign in.</Text>
    </KeyboardAvoidingView>
  </Screen>;
}
