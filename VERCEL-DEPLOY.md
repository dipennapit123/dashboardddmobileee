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

### Create tables (required if the DB is empty)

The app needs tables `Admin`, `User`, `UserActivity`, and `Horoscope`. If you have no migration yet:

1. In Supabase: **SQL Editor** → **New query**.
2. Copy the contents of **`supabase/schema.sql`** in this repo and paste into the editor.
3. Click **Run**. That creates all tables. Then create your first admin from the dashboard login page (**First time? Create admin account**).

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

### 503 on /api/users/me, /api/users/zodiac, /api/horoscopes/history, etc.

**503 means the app cannot reach the database from Vercel.** Fix it like this:

1. **Set env vars in Vercel** (not only in local `.env`):  
   **Vercel → Your project → Settings → Environment Variables.**  
   Add `DATABASE_URL` (and optionally `DATABASE_URL_POOLER`) for **Production** (and Preview if you use it).

2. **Use the correct Supabase connection string:**
   - Supabase Dashboard → your project → **Project Settings → Database**.
   - Under **Connection string**, open the **Session pooler** tab.
   - Copy the **URI**; it should look like  
     `postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres`  
     **Use port 6543** for the Session pooler (not 5432).
   - Replace `[YOUR-PASSWORD]` with your real DB password. If the password has `@`, `#`, or `%`, encode them as `%40`, `%23`, `%25`.

3. **Supabase project must be active:** If the project is **Paused**, restore it in the Supabase dashboard.

4. **Redeploy:** After changing env vars, trigger a new deployment (Deployments → ⋮ → Redeploy).

5. **Check:** Open `https://YOUR_PROJECT.vercel.app/api/health`. The JSON should show `"database": "connected"`. If it shows `"disconnected"`, the DB URL or Supabase state is still wrong.

- **API returns 500:** Usually missing or wrong env (e.g. `DATABASE_URL`, `ADMIN_JWT_SECRET`). Check Vercel → Project → Settings → Environment Variables and redeploy. If the error says "Database unavailable", use the Supabase Session pooler URL and ensure the project is not paused.
- **404 NOT_FOUND:**  
  - If you see this on the **root URL** (`https://your-app.vercel.app/`), set **Root Directory** in Vercel: **Project → Settings → General → Root Directory**.  
  - If you deployed the **dashreview** repo (app at repo root): leave Root Directory **empty** or `.`.  
  - If you deployed the **monorepo** (ao-horoscope): set Root Directory to **`admin-dashboard2`**.  
  - Then **Redeploy** (Deployments → ⋮ → Redeploy).  
  - Check the **Build** log; the build must finish without errors.
- **Database errors:** Ensure Supabase project is not paused and `DATABASE_URL` is the pooler URL (port 6543).
- **503 / connection errors:** Check Supabase connection string and that the project is in the same region as the pooler host.
- **Mobile auth fails:** Verify `CLERK_JWT_ISSUER` matches your Clerk Frontend API URL and that the mobile app uses the same Clerk application.
