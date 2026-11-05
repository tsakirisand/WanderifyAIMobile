export function authErrorMessage(error: unknown, action: "sign in" | "create account" | "send reset link") {
  const code = typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" ? error.code.toLowerCase() : "";
  if (code.includes("api-key-not-valid") || code === "auth/invalid-api-key") {
    return "Firebase rejected the API key in mobile/.env. Copy the current key from Firebase Console → Project settings → General → Your apps. If the key is correct, check its Google Cloud API key restrictions and allow Identity Toolkit API. Then restart Expo with --clear.";
  }
  switch (code) {
    case "auth/operation-not-allowed": return "Email and password sign-in is disabled. Enable Authentication → Sign-in method → Email/Password in Firebase Console.";
    case "auth/unauthorized-domain": return "This web address is not allowed by Firebase. Add the current hostname under Authentication → Settings → Authorized domains.";
    case "auth/network-request-failed": return "Firebase could not be reached. Check your internet connection and try again.";
    case "auth/invalid-email": return "Enter a valid email address.";
    case "auth/email-already-in-use": return "An account already uses this email. Try signing in instead.";
    case "auth/weak-password": return "Choose a stronger password with at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password": return "The email or password is incorrect.";
    case "auth/too-many-requests": return "Too many attempts. Wait a little and try again.";
    default: return code ? `Could not ${action} (${code}). Check Firebase Authentication settings and try again.` : `Could not ${action}. Check your connection and try again.`;
  }
}
