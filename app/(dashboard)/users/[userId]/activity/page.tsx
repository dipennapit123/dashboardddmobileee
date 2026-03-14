"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import { api } from "@/lib/api-client";

interface Activity {
  id: string;
  action: string;
  createdAt: string;
  platform: string | null;
  appVersion: string | null;
}

interface ActivityData {
  user: { id: string; email: string; fullName: string | null; zodiacSign: string | null };
  activities: Activity[];
}

export default function UserActivityPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get<ActivityData>(`/admin/users/${userId}/activity`);
        setData(res.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  if (!userId) {
    router.replace("/users");
    return null;
  }

  if (loading) return <div className="text-slate-400">Loading...</div>;
  if (!data) return <div className="text-slate-400">User not found.</div>;

  return (
    <div className="space-y-6">
      <Link href="/users" className="text-sm text-purple-400 hover:text-purple-300">
        ← Users
      </Link>
      <h1 className="text-2xl font-semibold">Activity</h1>
      <p className="text-slate-400">
        {data.user.fullName || data.user.email} · {data.user.zodiacSign ?? "—"}
      </p>
      <ul className="space-y-2">
        {data.activities.map((a) => (
          <li
            key={a.id}
            className="rounded-lg border border-purple-500/20 bg-purple-900/10 px-4 py-3"
          >
            <span className="font-medium">{a.action}</span>
            <span className="ml-2 text-sm text-slate-400">
              {dayjs(a.createdAt).format("MMM D, YYYY HH:mm")}
              {a.platform ? ` · ${a.platform}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
