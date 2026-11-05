import React, { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { AppButton, Card, FormFeedback, Input, Notice, Screen, ScreenTitle } from "../../src/components/NativeUI";
import { auth, firebaseConfigured } from "../../src/lib/firebase";
import { authErrorMessage } from "../../src/lib/auth-errors";
import { colors } from "../../src/theme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; message: string } | null>(null);

  async function resetPassword() {
    setFeedback(null);
    if (!auth) return setFeedback({ tone: "error", message: "Firebase is not configured. Check mobile/.env and restart Expo with --clear." });
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setFeedback({ tone: "success", message: "If an account exists for that address, Firebase has sent a password reset link." });
    } catch (error) {
      setFeedback({ tone: "error", message: authErrorMessage(error, "send reset link") });
    } finally { setLoading(false); }
  }

  return <Screen><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ gap: 20 }}>
    <ScreenTitle eyebrow="Account help" title="Reset your password" subtitle="We’ll send a password reset link to your email." />
    {!firebaseConfigured ? <Notice>Set up Firebase client values in mobile/.env to use password reset.</Notice> : null}
    {feedback ? <FormFeedback tone={feedback.tone}>{feedback.message}</FormFeedback> : null}
    <Card><Input label="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="you@example.com" /><AppButton label="Send reset link" onPress={resetPassword} icon="mail-outline" loading={loading} disabled={!email.trim() || !firebaseConfigured} /></Card>
    <Link href="/login" style={{ color: colors.primary, fontWeight: "800", textAlign: "center", padding: 10 }}>Back to sign in</Link>
  </KeyboardAvoidingView></Screen>;
}
