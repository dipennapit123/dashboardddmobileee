# Connecting the mobile app to admin-dashboard2

The mobile app (Expo + Clerk) talks to this Next.js app’s API so you can use one backend for both the admin dashboard and the app.

**You do not need to configure the mobile app with Supabase.** Only this backend (admin-dashboard2) connects to Supabase. The mobile only needs `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`; all data (users, horoscopes) goes through this API.

## 1. Clerk (same app as mobile)

Use the **same** Clerk application for the mobile app and for JWT verification here.

- In [Clerk Dashboard](https://dashboard.clerk.com) → your application → **Configure** → **API Keys**:
  - Copy **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in the mobile app).
  - Copy **Secret key** → `CLERK_SECRET_KEY` (only in admin-dashboard2, not in mobile).
- **JWT Issuer** (required for mobile auth): in Clerk Dashboard → **Configure** → **JWT Templates** (or **API Keys**), use the **Frontend API** URL as issuer, e.g. `https://<your-instance>.clerk.accounts.dev` (no trailing slash). Set it as `CLERK_JWT_ISSUER` in admin-dashboard2 `.env` and `.env.local`.

## 2. admin-dashboard2 env

In `admin-dashboard2/.env` and `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_JWT_ISSUER="https://<your-instance>.clerk.accounts.dev"
```

## 3. Mobile app env

In `mobile/.env`:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — same as in Clerk Dashboard (you likely have this already).
- `EXPO_PUBLIC_API_BASE_URL` — base URL of this app’s API:
  - **Production (hosted):** `https://astradailyadmin.org/api`
  - Same machine: `http://localhost:3000/api`
  - Device/simulator on LAN: `http://<your-machine-IP>:3000/api` (e.g. `http://192.168.1.69:3000/api`)

## 4. Run

1. Start admin-dashboard2: `cd admin-dashboard2 && npm run dev` (runs on port 3000).
2. Start the mobile app: `cd mobile && npm start`.
3. On a physical device, ensure the device and the machine running Next.js are on the same network and use the machine’s IP in `EXPO_PUBLIC_API_BASE_URL`.

## User API routes (used by mobile)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/users/sync-clerk-user` | — | Sync Clerk user (body: clerkUserId, email, fullName?, avatarUrl?, timezone?) |
| GET | `/api/users/me` | Clerk JWT or x-clerk-user-id | Current user |
| PATCH | `/api/users/zodiac` | Clerk JWT or x-clerk-user-id | Set zodiac sign (body: zodiacSign) |
| POST | `/api/users/activity` | Clerk JWT or x-clerk-user-id | Record activity (body: action, sessionId?, timezone?, platform?, appVersion?) |
| GET | `/api/horoscopes/today` | Clerk JWT or x-clerk-user-id | Today’s horoscope for user’s sign |
| GET | `/api/horoscopes/history` | Clerk JWT or x-clerk-user-id | Horoscope history for user’s sign |

Admin routes (`/api/admin/*`) continue to use the existing admin JWT (or `ALLOW_ANONYMOUS_ADMIN` in dev).

## After hosting on Vercel

1. In Vercel, set all env vars from `.env.example` (see **VERCEL-DEPLOY.md**). Do **not** set `ALLOW_ANONYMOUS_ADMIN` in production.
2. In `mobile/.env`, set:
   ```env
   EXPO_PUBLIC_API_BASE_URL="https://astradailyadmin.org/api"
   ```
3. Rebuild or restart the mobile app so it uses the new API URL.
