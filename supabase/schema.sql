-- AstraDaily / admin-dashboard2 — run this in Supabase SQL Editor to create tables
-- Supabase Dashboard → SQL Editor → New query → paste and Run

-- Admin (dashboard login)
CREATE TABLE IF NOT EXISTS "Admin" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'SUPER_ADMIN' CHECK (role IN ('SUPER_ADMIN', 'EDITOR')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User (mobile app users, synced from Clerk)
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clerkUserId" TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  "fullName" TEXT,
  "avatarUrl" TEXT,
  "zodiacSign" TEXT CHECK ("zodiacSign" IN (
    'ARIES','TAURUS','GEMINI','CANCER','LEO','VIRGO',
    'LIBRA','SCORPIO','SAGITTARIUS','CAPRICORN','AQUARIUS','PISCES'
  )),
  timezone TEXT,
  "lastActiveAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "User_clerkUserId_idx" ON "User" ("clerkUserId");

-- UserActivity (app open, horoscope view, etc.)
CREATE TABLE IF NOT EXISTS "UserActivity" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'APP_OPEN','HOROSCOPE_VIEW','ZODIAC_SELECTED','SETTINGS_VIEW'
  )),
  "sessionId" TEXT,
  platform TEXT,
  "appVersion" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "UserActivity_userId_idx" ON "UserActivity" ("userId");

-- Horoscope
CREATE TABLE IF NOT EXISTS "Horoscope" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "zodiacSign" TEXT NOT NULL CHECK ("zodiacSign" IN (
    'ARIES','TAURUS','GEMINI','CANCER','LEO','VIRGO',
    'LIBRA','SCORPIO','SAGITTARIUS','CAPRICORN','AQUARIUS','PISCES'
  )),
  date TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  "wealthText" TEXT NOT NULL,
  "loveText" TEXT NOT NULL,
  "healthText" TEXT NOT NULL,
  "wealthConfidence" INTEGER NOT NULL DEFAULT 70,
  "loveConfidence" INTEGER NOT NULL DEFAULT 70,
  "healthConfidence" INTEGER NOT NULL DEFAULT 70,
  "wealthActionLabel" TEXT,
  "loveActionLabel" TEXT,
  "healthActionLabel" TEXT,
  "weeklyOutlook" TEXT,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdById" UUID,
  "updatedById" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Horoscope_date_idx" ON "Horoscope" (date);
CREATE INDEX IF NOT EXISTS "Horoscope_zodiacSign_date_idx" ON "Horoscope" ("zodiacSign", date);
