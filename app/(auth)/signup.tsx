import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } from "firebase/auth";
import { AppButton, Card, FormFeedback, Input, Notice, Screen, ScreenTitle } from "../../src/components/NativeUI";
import { auth, firebaseConfigured } from "../../src/lib/firebase";
import { authErrorMessage } from "../../src/lib/auth-errors";
import { colors, ui } from "../../src/theme";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; message: string } | null>(null);

  async function createAccount() {
    setFeedback(null);
    if (!auth) return setFeedback({ tone: "error", message: "Firebase is not configured. Check mobile/.env and restart Expo with --clear." });
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
      setVerificationPending(true);
      try {
        await sendEmailVerification(credential.user);
        setFeedback({ tone: "success", message: "Your account is ready. We sent a verification link to your inbox. Verify your email before signing in." });
      } catch (error) {
        setFeedback({ tone: "error", message: `Your account was created, but the verification email could not be sent. ${authErrorMessage(error, "create account")}` });
      }
    } catch (error) {
      setFeedback({ tone: "error", message: authErrorMessage(error, "create account") });
    } finally { setLoading(false); }
  }

  async function resendVerification() {
    if (!auth?.currentUser) {
      setFeedback({ tone: "error", message: "Your sign-up session ended. Sign in to continue." });
      return;
    }
    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setFeedback({ tone: "success", message: "A new verification link has been sent. Check your inbox and spam folder." });
    } catch (error) {
      setFeedback({ tone: "error", message: authErrorMessage(error, "create account") });
    } finally { setLoading(false); }
  }

  async function continueToSignIn() {
    setLoading(true);
    try {
      if (auth) await signOut(auth);
      router.replace("/login");
    } catch (error) {
      setFeedback({ tone: "error", message: authErrorMessage(error, "sign in") });
    } finally { setLoading(false); }
  }

  return <Screen>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ gap: 20 }}>
      <ScreenTitle eyebrow="Start exploring" title="Create your account" subtitle="Your trips sync securely to your Wanderify account." />
      {!firebaseConfigured ? <Notice>Set up Firebase client values in mobile/.env before creating an account.</Notice> : null}
      {feedback ? <FormFeedback tone={feedback.tone}>{feedback.message}</FormFeedback> : null}
      {verificationPending ? <View style={{ gap: 12 }}>
        <AppButton label={loading ? "Please wait…" : "Resend verification email"} onPress={resendVerification} icon="mail-outline" loading={loading} secondary />
        <AppButton label="Continue to sign in" onPress={continueToSignIn} icon="arrow-forward" loading={loading} />
      </View> : <Card>
        <Input label="Display name" value={name} onChangeText={setName} autoComplete="name" placeholder="Your name" maxLength={60} />
        <Input label="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="you@example.com" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" placeholder="At least 6 characters" />
        <Text style={ui.muted}>We’ll send a verification link before you can access trips.</Text>
        <AppButton label="Create account" onPress={createAccount} icon="person-add-outline" loading={loading} disabled={!email.trim() || password.length < 6 || !firebaseConfigured} />
        {firebaseConfigured && (!email.trim() || password.length < 6) ? <Text style={[ui.muted, { textAlign: "center" }]}>Enter an email and a password of at least 6 characters to enable account creation.</Text> : null}
      </Card>}
      <Link href="/login" style={{ color: colors.primary, fontWeight: "800", textAlign: "center", padding: 10 }}>Back to sign in</Link>
    </KeyboardAvoidingView>
  </Screen>;
}
