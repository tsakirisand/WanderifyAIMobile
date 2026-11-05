# Wanderify Mobile

Standalone Expo / React Native app in `/Users/andreastsakiris/WanderifyAIMob`. The existing Next.js project at `/Users/andreastsakiris/WanderifyAI` provides authenticated APIs, AI itinerary generation, WeatherAPI data and Stripe Checkout.

## Requirements and setup

Use Node.js 22.13 or newer. Install dependencies and configure local public client values:

```sh
cd /Users/andreastsakiris/WanderifyAIMob
npm install
cp .env.example .env
```

Edit `.env`:

- `EXPO_PUBLIC_API_URL`: URL of the Next.js backend. For a physical phone, use the Mac's LAN IP, for example `http://192.168.1.20:3000`, not `localhost`.
- `EXPO_PUBLIC_FIREBASE_*`: Firebase **client** configuration from Firebase Console → Project settings → Your apps. These are public app identifiers. Never put Firebase Admin credentials, Stripe secret keys, AI keys, or WeatherAPI keys in this file.

After creating or changing `.env`, stop the Expo process and restart with a cleared Metro cache so the new public values are embedded in the app bundle:

```sh
npx expo start --clear
```

The mobile app uses the Firebase project configured for the existing website. Enable Email/Password sign-in in Firebase Authentication. New users must verify their email before the API accepts requests.

## Backend configuration

The Next.js backend must have its existing server environment configured:

- Firebase Admin credentials: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
- `ANTHROPIC_API_KEY` (or the existing `CLAUDE_API_KEY`) for itinerary generation.
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` for checkout and webhook fulfillment.
- `WEATHER_API_KEY` for trip-date weather. It stays server-side.
- `APP_BASE_URL` for Stripe's success and cancel return pages. For a real Stripe checkout, this must be an address Stripe can reach; use the deployed HTTPS URL or an HTTPS tunnel. It is separate from the phone's LAN `EXPO_PUBLIC_API_URL`.

Start Next.js on the local network:

```sh
cd /Users/andreastsakiris/WanderifyAI
npm run dev -- --hostname 0.0.0.0
```

Find the Mac's LAN address in System Settings → Wi-Fi → Details, then set that address in `EXPO_PUBLIC_API_URL`. The phone and Mac must be on the same Wi-Fi. A VPN or guest network may block device-to-device traffic.

## Run in Expo Go

This project targets Expo SDK 57. Install an Expo Go build that supports SDK 57, then:

```sh
cd /Users/andreastsakiris/WanderifyAIMob
npm start
```

Scan the terminal QR code with the iPhone Camera or Expo Go on Android. If LAN discovery is blocked, try `npx expo start --tunnel`.

## Features

- Expo Router navigation with protected authenticated tabs.
- Firebase email/password login, account creation, email verification and password reset; Firebase Auth persists in AsyncStorage.
- Server-owned trip listing, detail, editing and deletion with Firebase ID token verification and owner checks.
- Multi-step planner that creates Stripe Checkout sessions on the server; the mobile client cannot set the owner or price. Payment is verified before itinerary generation and trip display.
- Existing AI-generated itinerary data, day-by-day timeline, route markers where backend coordinates exist, directions via external Maps, and forecast / previous-year historical weather labels.
- Native itinerary PDF generation and sharing.
- Profile display name updates and sign out.

## Expo Go limits

- Email/password works in Expo Go. Google sign-in is not wired because the current project has no native OAuth client configuration; a future Google sign-in should use an Expo development build and registered iOS/Android OAuth clients.
- `react-native-maps` is used because it is included in Expo Go. The downloaded Mapbox native plugin cannot run in Expo Go and requires a development build. The map shows only coordinates returned by Wanderify; the app does not invent pins. Map directions open the user's installed map app/browser.
- Stripe uses hosted Checkout in the system browser. Return to Wanderify and press “I’ve returned — verify payment” if automatic resume does not happen. Payment status is retrieved from Stripe on the server; no success state is trusted from the client.
- PDF export uses Expo Print and the native share sheet. It is generated from the saved itinerary and labels AI recommendations as unverified suggestions.
- Destination photos use the existing Wikimedia-backed server action and static fallbacks. No Unsplash key is required while account approval is pending.
- The Expo Go project is a development preview, not an App Store / Play Store release binary. Store distribution and native OAuth/deep-link setup need a development build and additional configuration.

## Validation commands

```sh
npm run typecheck
npx expo install --check
npx expo-doctor
npx expo export --platform ios --platform android
```

Backend checks from `/Users/andreastsakiris/WanderifyAI`:

```sh
npx tsc --noEmit
npm run lint
node --test tests/mobile-api-security.test.mjs
```

The security tests cover owner matching, planner/itinerary validation, date validation and fixed-price paid-session checks. Firebase/Stripe live flows still require configured credentials and a test account; Expo Go visual/device checks require your phone.
