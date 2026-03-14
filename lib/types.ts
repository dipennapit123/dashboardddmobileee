export type ZodiacSign =
  | "ARIES"
  | "TAURUS"
  | "GEMINI"
  | "CANCER"
  | "LEO"
  | "VIRGO"
  | "LIBRA"
  | "SCORPIO"
  | "SAGITTARIUS"
  | "CAPRICORN"
  | "AQUARIUS"
  | "PISCES";

export type AdminRole = "SUPER_ADMIN" | "EDITOR";

export type UserActivityAction =
  | "APP_OPEN"
  | "HOROSCOPE_VIEW"
  | "ZODIAC_SELECTED"
  | "SETTINGS_VIEW";

export const ZODIAC_SIGNS: ZodiacSign[] = [
  "ARIES", "TAURUS", "GEMINI", "CANCER", "LEO", "VIRGO",
  "LIBRA", "SCORPIO", "SAGITTARIUS", "CAPRICORN", "AQUARIUS", "PISCES",
];

export interface UserRow {
  id: string;
  clerkUserId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  zodiacSign: ZodiacSign | null;
  timezone: string | null;
  lastActiveAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserActivityRow {
  id: string;
  userId: string;
  action: UserActivityAction;
  sessionId: string | null;
  platform: string | null;
  appVersion: string | null;
  createdAt: Date;
}

export interface AdminRow {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface HoroscopeRow {
  id: string;
  zodiacSign: ZodiacSign;
  date: Date;
  title: string;
  summary: string;
  wealthText: string;
  loveText: string;
  healthText: string;
  wealthConfidence: number;
  loveConfidence: number;
  healthConfidence: number;
  wealthActionLabel: string | null;
  loveActionLabel: string | null;
  healthActionLabel: string | null;
  weeklyOutlook: string | null;
  isPublished: boolean;
  createdById: string | null;
  updatedById: string | null;
  createdAt: Date;
  updatedAt: Date;
}
