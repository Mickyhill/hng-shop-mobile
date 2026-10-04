# AGENTS.md

Guidance for AI coding agents working on this repository.

## Project

MickyHill Store mobile app: Expo (React Native, TypeScript strict) client for the website at https://mickyhill-store.vercel.app. HNG Internship 15, Task 3.

## Rules

- Expo changes every SDK. Read the `expo` version in `package.json` and check https://docs.expo.dev/versions/v<major>.0.0/ before using an Expo API.
- Install packages with `npx expo install <package>`, not `npm install <package>`.
- Navigation is the small stack in `src/navigation.tsx`. Add a screen by adding a `Route` variant and a case in `renderRoute` in `App.tsx`.
- The backend belongs to the website repo (`Mickyhill/hng-shop`). Database changes go there as a new file in `supabase/migrations/`.
- Orders go only through `POST /api/checkout` on the website (`src/lib/api.ts`). Never insert orders from the app.
- Cart writes go only through the `cart_add` and `cart_set` RPCs.
- Money is integer kobo. Format with `formatKobo()` at render time.
- Only `EXPO_PUBLIC_*` public values in `.env`. Never add a secret or service_role key.
- Use the colours in `src/theme.ts`. Every pressable needs `accessibilityRole` and a label.
- Show loading, empty and error states for every data view.

## Checks

Run `npx tsc --noEmit` before every commit.
