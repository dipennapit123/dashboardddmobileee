"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  fullName: string | null;
  zodiacSign: string | null;
  onboardedAt: string;
  activityCount: number;
  lastActiveAt: string | null;
}

interface ListData {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

interface UserAnalytics {
  dau: number;
  mau: number;
  yearly: Array<{ year: number; month: number; activeUsers: number }>;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get<ListData>(`/admin/users?page=${page}&pageSize=20`);
      setUsers(res.data?.users ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await api.get<UserAnalytics>("/admin/users/analytics");
      setAnalytics(res.data);
    } catch {
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, search]);

  return (
    <div className="min-h-screen bg-background/5 text-slate-100">
      <header className="mb-6 flex flex-col gap-4 border-b border-purple-900/40 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl text-primary">
            cloud_queue
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
            <p className="text-xs text-muted-foreground">
              Onboarded users, DAU/MAU and yearly activity.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by email..."
              className="w-full rounded-full bg-purple-950/40 py-2 pl-10 pr-4 text-sm outline-none ring-1 ring-purple-900/60 placeholder:text-slate-500 focus:ring-primary/70"
            />
          </div>
        </div>
      </header>

      <div className="space-y-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-purple-900/60 bg-purple-950/60 p-5 shadow-lg shadow-purple-950/40">
            <p className="text-xs font-medium text-slate-400">
              Daily active users
            </p>
            {analyticsLoading || !analytics ? (
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-purple-900/40" />
            ) : (
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{analytics.dau}</span>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-purple-900/60 bg-purple-950/60 p-5 shadow-lg shadow-purple-950/40">
            <p className="text-xs font-medium text-slate-400">
              Monthly active users
            </p>
            {analyticsLoading || !analytics ? (
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-purple-900/40" />
            ) : (
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{analytics.mau}</span>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-purple-900/60 bg-purple-950/60 p-5 shadow-lg shadow-purple-950/40">
            <p className="text-xs font-medium text-slate-400">Total users</p>
            {loading && page === 1 ? (
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-purple-900/40" />
            ) : (
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{total}</span>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-purple-900/60 bg-purple-950/60 p-5 shadow-lg shadow-purple-950/40">
            <p className="text-xs font-medium text-slate-400">
              30‑day retention (concept)
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold">—</span>
              <span className="text-xs text-slate-500">
                (configure once metric is available)
              </span>
            </div>
          </div>
        </section>

        <div className="overflow-hidden rounded-xl border border-purple-900/60 bg-purple-950/40 shadow-lg shadow-purple-950/30">
          {loading && page === 1 ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-14 w-full animate-pulse rounded-lg bg-purple-900/40"
                />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No users found.
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-purple-900/60 bg-purple-950/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Zodiac</th>
                  <th className="px-6 py-4">Activity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/40">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="transition-colors hover:bg-purple-900/30"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium">{u.fullName || u.email}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {u.zodiacSign ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {u.activityCount} activities
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/users/${u.id}/activity`}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        View activity
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {total > 0 && (
            <div className="flex items-center justify-between border-t border-purple-900/40 bg-purple-950/60 px-6 py-4">
              <span className="text-xs text-slate-500">
                Page {page} · {total} total
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-full border border-purple-900/60 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full border border-purple-900/60 px-3 py-1.5 text-xs font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
