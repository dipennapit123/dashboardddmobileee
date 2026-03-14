# Deploy admin-dashboard2 on Vercel

This app runs the admin dashboard and the API used by the mobile app. After deployment, point the mobile app to your Vercel URL.

## 1. Deploy to Vercel

- Push this repo (or `admin-dashboard2` as root) to GitHub and import the project in [Vercel](https://vercel.com).
- **Root Directory:** If the repo root is the monorepo, set **Root Directory** to `admin-dashboard2`.
- Vercel will detect Next.js and use the default build.

## 2. Environment variables (Vercel Dashboard)

In **Project → Settings → Environment Variables**, add these for **Production** (and Preview if you want):

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Use Supabase **Session pooler** URL (port 6543). Best for serverless. |
| `DATABASE_URL_POOLER` | Optional | Same pooler URL; on Vercel the app prefers this when set. |
| `ADMIN_JWT_SECRET` | Yes | Long random string (e.g. `openssl rand -base64 32`). |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes (for mobile) | From Clerk Dashboard. |
| `CLERK_SECRET_KEY` | Yes (for mobile) | From Clerk Dashboard. |
| `CLERK_JWT_ISSUER` | Yes (for mobile) | Your Clerk Frontend API URL, e.g. `https://xxx.clerk.accounts.dev` (no trailing slash). |
| `GROQ_API_KEY` | Optional | For AI horoscope generation. |
| `GEMINI_API_KEY` | Optional | Alternative AI. |

**Do not set** `ALLOW_ANONYMOUS_ADMIN` on Vercel (or set it to `false`). That would allow unauthenticated admin API access.

## 3. Database (Supabase)

- Supabase project must be **active** (not paused).
- Use the **Session mode** pooler connection string from: Supabase → Project Settings → Database → **Connection string** → **Session pooler** (port **6543**).
- URL-encode the password if it contains special characters.

## 4. Mobile app after hosting

Once deployed, your API base URL will be:

```text
https://YOUR_PROJECT.vercel.app/api
```

In the **mobile** app `.env`:

```env
EXPO_PUBLIC_API_BASE_URL="https://YOUR_PROJECT.vercel.app/api"
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

Use the same Clerk publishable key as in the Vercel env. Rebuild/restart the mobile app after changing env.

## 5. Check deployment

- Open `https://YOUR_PROJECT.vercel.app` and log in to the admin dashboard.
- Health: `https://YOUR_PROJECT.vercel.app/api/health`
- From the mobile app, sign in and confirm horoscope and user APIs work.

## Troubleshooting

- **404 NOT_FOUND:**  
  - If you see this on the **root URL** (`https://your-app.vercel.app/`), set **Root Directory** in Vercel: **Project → Settings → General → Root Directory**.  
  - If you deployed the **dashreview** repo (app at repo root): leave Root Directory **empty** or `.`.  
  - If you deployed the **monorepo** (ao-horoscope): set Root Directory to **`admin-dashboard2`**.  
  - Then **Redeploy** (Deployments → ⋮ → Redeploy).  
  - Check the **Build** log; the build must finish without errors.
- **Database errors:** Ensure Supabase project is not paused and `DATABASE_URL` is the pooler URL (port 6543).
- **503 / connection errors:** Check Supabase connection string and that the project is in the same region as the pooler host.
- **Mobile auth fails:** Verify `CLERK_JWT_ISSUER` matches your Clerk Frontend API URL and that the mobile app uses the same Clerk application.
