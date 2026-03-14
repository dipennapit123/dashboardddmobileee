import { query } from "./db";
import type { UserActivityRow } from "./types";

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}
function endOfDay(d: Date): Date {
  const out = new Date(d);
  out.setUTCHours(23, 59, 59, 999);
  return out;
}
function startOfMonth(d: Date): Date {
  const out = new Date(d);
  out.setUTCDate(1);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}
function endOfMonth(d: Date): Date {
  const out = new Date(d);
  out.setUTCMonth(out.getUTCMonth() + 1);
  out.setUTCDate(0);
  out.setUTCHours(23, 59, 59, 999);
  return out;
}

export async function listUsers(params?: { page?: number; pageSize?: number }) {
  const page = params?.page && params.page > 0 ? params.page : 1;
  const pageSize = params?.pageSize && params.pageSize > 0 ? params.pageSize : 50;
  const skip = (page - 1) * pageSize;
  const [usersResult, totalResult] = await Promise.all([
    query<{
      id: string;
      email: string;
      fullName: string | null;
      zodiacSign: string | null;
      timezone: string | null;
      createdAt: Date;
      lastActiveAt: Date | null;
      activity_count: string;
    }>(
      `SELECT u.id, u.email, u."fullName", u."zodiacSign", u.timezone, u."createdAt", u."lastActiveAt",
              (SELECT COUNT(*) FROM "UserActivity" a WHERE a."userId" = u.id)::text as activity_count
       FROM "User" u
       ORDER BY u."createdAt" DESC
       LIMIT $1 OFFSET $2`,
      [pageSize, skip]
    ),
    query<{ count: string }>('SELECT COUNT(*)::text as count FROM "User"'),
  ]);
  const total = parseInt(totalResult.rows[0]?.count ?? "0", 10);
  return {
    users: usersResult.rows.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      zodiacSign: u.zodiacSign,
      timezone: u.timezone ?? null,
      onboardedAt: u.createdAt,
      activityCount: parseInt(u.activity_count, 10),
      lastActiveAt: u.lastActiveAt ?? null,
    })),
    total,
    page,
    pageSize,
  };
}

export async function getUserAnalytics() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const [dauRows, mauRows, yearlyRows] = await Promise.all([
    query<{ userId: string }>(
      `SELECT "userId" FROM "UserActivity"
       WHERE "createdAt" >= $1 AND "createdAt" <= $2`,
      [todayStart.toISOString(), todayEnd.toISOString()]
    ),
    query<{ userId: string }>(
      `SELECT "userId" FROM "UserActivity"
       WHERE "createdAt" >= $1 AND "createdAt" <= $2`,
      [monthStart.toISOString(), monthEnd.toISOString()]
    ),
    query<{ userId: string; createdAt: Date }>(
      `SELECT "userId", "createdAt" FROM "UserActivity"
       WHERE "createdAt" >= $1 AND "createdAt" <= $2`,
      [new Date(now.getUTCFullYear(), 0, 1).toISOString(), now.toISOString()]
    ),
  ]);
  const dau = new Set(dauRows.rows.map((r) => r.userId)).size;
  const mau = new Set(mauRows.rows.map((r) => r.userId)).size;
  const monthlyActiveUsers: { year: number; month: number; activeUsers: number }[] = [];
  const seen = new Map<string, Set<string>>();
  yearlyRows.rows.forEach((r) => {
    const d = new Date(r.createdAt);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    if (!seen.has(key)) seen.set(key, new Set());
    seen.get(key)!.add(r.userId);
  });
  seen.forEach((userIds, key) => {
    const [y, m] = key.split("-").map(Number);
    monthlyActiveUsers.push({ year: y, month: m + 1, activeUsers: userIds.size });
  });
  monthlyActiveUsers.sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  );
  return { dau, mau, yearly: monthlyActiveUsers };
}

export async function getUserActivity(
  userId: string,
  params?: { limit?: number }
) {
  const limit =
    params?.limit && params.limit > 0 ? Math.min(params.limit, 200) : 50;
  const [userResult, activitiesResult] = await Promise.all([
    query<{
      id: string;
      email: string;
      fullName: string | null;
      zodiacSign: string | null;
      timezone: string | null;
      createdAt: Date;
    }>(
      `SELECT id, email, "fullName", "zodiacSign", timezone, "createdAt"
       FROM "User" WHERE id = $1`,
      [userId]
    ),
    query<UserActivityRow>(
      `SELECT id, "userId", action, "sessionId", platform, "appVersion", "createdAt"
       FROM "UserActivity" WHERE "userId" = $1
       ORDER BY "createdAt" DESC LIMIT $2`,
      [userId, limit]
    ),
  ]);
  const user = userResult.rows[0];
  if (!user) return null;
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      zodiacSign: user.zodiacSign,
      timezone: user.timezone ?? null,
      onboardedAt: user.createdAt,
    },
    activities: activitiesResult.rows.map((a) => ({
      ...a,
      createdAt: a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt),
    })),
  };
}
