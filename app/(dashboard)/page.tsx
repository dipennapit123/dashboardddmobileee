"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { api } from "@/lib/api-client";

interface DashboardStats {
  totalHoroscopes: number;
  publishedHoroscopes: number;
  draftHoroscopes: number;
  totalUsers: number;
}

interface UserAnalytics {
  dau: number;
  mau: number;
  yearly: Array<{ year: number; month: number; activeUsers: number }>;
}

interface Horoscope {
  id: string;
  zodiacSign: string;
  date: string;
  title: string;
  summary: string;
  isPublished: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [recent, setRecent] = useState<Horoscope[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [todayRangeLabel, setTodayRangeLabel] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const mounted = useRef(true);

  const loadAll = useCallback(async () => {
    setApiError(null);
    const [statsRes, analyticsRes, recentRes] = await Promise.allSettled([
      api.get<DashboardStats>("/admin/horoscopes/dashboard/stats"),
      api.get<UserAnalytics>("/admin/users/analytics"),
      api.get<Horoscope[]>("/admin/horoscopes?page=1&pageSize=4"),
    ]);
    if (!mounted.current) return;
    const failed = [statsRes, analyticsRes, recentRes].find((r) => r.status === "rejected");
    if (failed && failed.status === "rejected") {
      setApiError(failed.reason?.message ?? "Failed to load dashboard data.");
    }
    if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
    if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value.data);
    if (recentRes.status === "fulfilled") {
      const list = Array.isArray(recentRes.value.data) ? recentRes.value.data : [];
      setRecent(list.slice(0, 4));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    mounted.current = true;
    setTodayRangeLabel(`${dayjs().subtract(30, "day").format("MMM D, YYYY")} - ${dayjs().format("MMM D, YYYY")}`);
    loadAll();
    return () => { mounted.current = false; };
  }, [loadAll]);

  const skeleton = <div className="mt-2 h-7 w-16 rounded-2xl bg-purple-900/40 animate-pulse" />;

  return (
    <div className="space-y-8">
      {apiError && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <strong>API error:</strong> {apiError}
          {apiError.includes("Database") && " Set DATABASE_URL (and DATABASE_URL_POOLER) in Vercel → Settings → Environment Variables and redeploy."}
          {apiError.includes("authorization") && " Log in via the Sign out link below, or set ALLOW_ANONYMOUS_ADMIN for local dev only."}
        </div>
      )}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Here&apos;s how AstraDaily is performing today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full border border-purple-900/40 bg-background/40 px-4 py-2 text-xs md:text-sm">
            <span className="material-symbols-outlined mr-2 text-purple-300">
              calendar_today
            </span>
            <span className="font-medium" suppressHydrationWarning>{todayRangeLabel || "—"}</span>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="person_add" label="Daily active users" badge="Today">
          {!loaded ? skeleton : <p className="mt-2 text-2xl font-semibold">{analytics?.dau ?? 0}</p>}
        </StatCard>
        <StatCard icon="groups" label="Monthly active users" badge="30 days">
          {!loaded ? skeleton : <p className="mt-2 text-2xl font-semibold">{analytics?.mau ?? 0}</p>}
        </StatCard>
        <StatCard icon="verified_user" label="Total onboarded users">
          {!loaded ? skeleton : <p className="mt-2 text-2xl font-semibold">{stats?.totalUsers ?? 0}</p>}
        </StatCard>
        <StatCard icon="auto_stories" label="Published horoscopes" badge="Today">
          {!loaded ? skeleton : (
            <p className="mt-2 text-2xl font-semibold">
              {stats?.publishedHoroscopes ?? 0}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / {stats?.totalHoroscopes ?? 0}
              </span>
            </p>
          )}
        </StatCard>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr,minmax(0,1.3fr)]">
        <div className="rounded-2xl border border-purple-900/40 bg-gradient-to-b from-[#100720] to-[#050316] p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">DAU / MAU growth</h2>
            <p className="text-xs text-muted-foreground">
              User retention trend over the last month.
            </p>
          </div>
          <div className="relative h-64 w-full">
            <svg viewBox="0 0 1000 300" className="h-full w-full" preserveAspectRatio="none">
              <line x1="0" x2="1000" y1="60" y2="60" className="text-purple-900/40" stroke="currentColor" strokeWidth="1" />
              <line x1="0" x2="1000" y1="150" y2="150" className="text-purple-900/40" stroke="currentColor" strokeWidth="1" />
              <line x1="0" x2="1000" y1="240" y2="240" className="text-purple-900/40" stroke="currentColor" strokeWidth="1" />
              <defs>
                <linearGradient id="dashChartStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7f13ec" />
                  <stop offset="100%" stopColor="#b062ff" />
                </linearGradient>
                <linearGradient id="dashChartFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7f13ec" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M0,240 Q80,210 160,220 T320,170 T480,140 T640,150 T760,100 T880,120 T1000,80"
                fill="none" stroke="url(#dashChartStroke)" strokeWidth="4" strokeLinecap="round"
              />
              <path
                d="M0,240 Q80,210 160,220 T320,170 T480,140 T640,150 T760,100 T880,120 T1000,80 V300 H0 Z"
                fill="url(#dashChartFill)" opacity="0.4"
              />
            </svg>
            <div className="mt-3 flex justify-between px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Day 1</span><span>Day 7</span><span>Day 14</span><span>Day 21</span><span>Day 30</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-purple-900/40 bg-gradient-to-b from-[#0b0515] to-[#050316]">
          <div className="flex items-center justify-between border-b border-purple-900/40 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Recent horoscopes</h2>
              <p className="text-[11px] text-muted-foreground">Latest generated or edited entries.</p>
            </div>
          </div>
          {!loaded ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-purple-900/30" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground">No recent horoscopes yet.</div>
          ) : (
            <table className="min-w-full text-xs">
              <thead className="bg-purple-900/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Zodiac</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((h) => (
                  <tr key={h.id} className="border-t border-purple-900/40">
                    <td className="px-4 py-2">{dayjs(h.date).format("MMM D, YYYY")}</td>
                    <td className="px-4 py-2">{h.zodiacSign}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${h.isPublished ? "bg-emerald-500/15 text-emerald-300" : "bg-yellow-500/10 text-yellow-300"}`}>
                        {h.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, badge, children }: { icon: string; label: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-purple-900/40 bg-gradient-to-b from-purple-900/40 to-purple-950/20 p-5 shadow-lg shadow-purple-950/30">
      <div className="mb-3 flex items-start justify-between">
        <div className="rounded-lg bg-purple-500/20 p-2">
          <span className="material-symbols-outlined text-purple-200">{icon}</span>
        </div>
        {badge && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
