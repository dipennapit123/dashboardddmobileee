# Fix "Database unavailable"

Your app can’t reach the database host. Do the following.

## 1. Supabase project is running

- Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project.
- If it says **Paused**, click **Restore project** and wait until it’s running.

## 2. Use the connection string from Supabase

1. In the project: **Project Settings** (gear) → **Database**.
2. Scroll to **Connection string**.
3. Try the **Session pooler** (recommended) or **Transaction pooler** tab — the host will be something like:
   - `aws-0-us-east-1.pooler.supabase.com`
   - Port may be **6543** (pooler) instead of 5432.
4. Copy the **URI** and replace `[YOUR-PASSWORD]` with your real database password.
5. If the password contains `@`, `#`, or `%`, URL-encode them:
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`

Example (password is `mypass@123`):

```env
DATABASE_URL="postgresql://postgres.tkfdajsukbgrgipvrbly:mypass%40123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

6. Put this in **admin-dashboard2** `.env` and `.env.local` (and in **backend** `.env` if you use it).
7. Restart the dev server: stop `npm run dev`, then run it again.

## 3. If the direct host works for you

Some networks resolve the direct host `db.xxx.supabase.co` fine. Then keep:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_ENCODED@db.tkfdajsukbgrgipvrbly.supabase.co:5432/postgres"
```

Use the **Database** → **Connection string** → **URI** from the dashboard so the host and port match what Supabase shows.

## 4. Test from your machine

In a terminal:

```bash
nslookup db.tkfdajsukbgrgipvrbly.supabase.co
```

If that fails, the direct host doesn’t resolve on your network — use the **pooler** URL from step 2 instead.
