# AstraDaily Admin (Next.js)

Single Next.js app with **backend API** and **admin frontend** in one project. No separate Express server or CORS setup.

## Run locally

1. Copy env and set your database + JWT secret:
   ```bash
   cp .env.example .env.local
   # Edit .env.local: DATABASE_URL, ADMIN_JWT_SECRET, optionally GROQ_API_KEY
   ```

2. Install and run:
   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000). Use **Login** or **First time? Create admin account** to create the first admin (when the DB has no admins).

## Structure

- **Backend (API)** – `app/api/`
  - `GET /api/health` – health + DB status
  - `POST /api/admin/auth/login` – admin login
  - `POST /api/admin/auth/setup` – create first admin
  - `GET/POST /api/admin/horoscopes` – list, create
  - `GET/PATCH/DELETE /api/admin/horoscopes/[id]` – get, update, delete
  - `PATCH /api/admin/horoscopes/[id]/publish` – publish/unpublish
  - `POST /api/admin/horoscopes/generate` – AI generate (uses GROQ if `GROQ_API_KEY` set)
  - `GET /api/admin/horoscopes/dashboard/stats` – dashboard stats
  - `GET /api/admin/users` – list users
  - `GET /api/admin/users/analytics` – DAU/MAU
  - `GET /api/admin/users/[userId]/activity` – user activity

- **Frontend** – `app/(dashboard)/` and `app/login/`
  - Login, Dashboard, Horoscopes (list + edit), Generate, Users, User activity, Settings

- **Shared** – `lib/`
  - `db.ts` – PostgreSQL (pg) pool and queries
  - `env.ts` – env config
  - `types.ts` – shared types
  - `admin-auth.service.ts`, `admin-horoscope.service.ts`, `admin-users.service.ts`
  - `generator.ts` – Mock + Groq horoscope generator
  - `auth.ts` – JWT verification for admin routes

## Env vars

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes* | Postgres connection string (or use DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME) |
| `ADMIN_JWT_SECRET` | Yes | Secret for admin JWT (min 32 chars) |
| `GROQ_API_KEY` | No | Enables AI horoscope generation via Groq |
| `GEMINI_API_KEY` | No | Alternative AI (not wired in generator yet) |

## Deploy

Deploy to Vercel (or any Node host). Set the same env vars in the project settings. The app runs as a single Next.js app (API routes + pages).
