# Task Manager — Expo (React Native)

Mobile version of the web Task Manager. Uses the same Supabase project.

## Why this lives in a separate folder

Lovable's preview only runs React + Vite. Expo / React Native must be run locally:

```bash
cd expo-app
npm install
cp .env.example .env   # then fill in your Supabase URL + anon key
npx expo start
```

Open in **Expo Go** (iOS/Android) or press `i` / `a` for simulators.

## What's included

- Expo Router (file-based routing under `app/`)
- Supabase client with AsyncStorage session persistence
- Auth: register, login, email OTP verification, logout
- Task CRUD with status lifecycle (`draft → todo → in_progress → review → completed → archived`)
- Role-Based Access Control via `user_roles` + `has_role()` SECURITY DEFINER
- In-app notifications (Supabase Realtime subscription)
- Sentry React Native integration (wrap root in `Sentry.wrap()`)
- TanStack Query for caching + optimistic updates

## Before first run

1. Open Supabase SQL editor and run `db/0002_full_schema.sql`.
2. In Supabase **Authentication → URL Configuration → Redirect URLs**, add:
   - `taskmanager://verify`
   - `taskmanager://reset-password`
3. Update `app.json` `scheme` if you want a different deep-link scheme.

## Sentry

```bash
npx @sentry/wizard@latest -i reactNative
```
Then add your DSN to `.env` as `EXPO_PUBLIC_SENTRY_DSN`.

## Reused from the web app

- `lib/tasks.ts` — CRUD calls (identical to web)
- `lib/supabase.ts` — same client, AsyncStorage adapter added
- SQL types and table shape
