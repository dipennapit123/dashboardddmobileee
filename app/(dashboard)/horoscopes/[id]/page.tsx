"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { ZodiacSign } from "@/lib/types";

const ZODIAC_SIGNS: ZodiacSign[] = [
  "ARIES", "TAURUS", "GEMINI", "CANCER", "LEO", "VIRGO",
  "LIBRA", "SCORPIO", "SAGITTARIUS", "CAPRICORN", "AQUARIUS", "PISCES",
];

interface Horoscope {
  id: string;
  zodiacSign: ZodiacSign;
  date: string;
  title: string;
  summary: string;
  wealthText: string;
  loveText: string;
  healthText: string;
  wealthConfidence: number;
  loveConfidence: number;
  healthConfidence: number;
  weeklyOutlook: string | null;
  isPublished: boolean;
}

export default function HoroscopeEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [h, setH] = useState<Horoscope | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Horoscope>>({});

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get<Horoscope>(`/admin/horoscopes/${id}`);
        const found = res.data;
        if (found) {
          setH(found);
          setForm({
            title: found.title,
            summary: found.summary,
            wealthText: found.wealthText,
            loveText: found.loveText,
            healthText: found.healthText,
            wealthConfidence: found.wealthConfidence,
            loveConfidence: found.loveConfidence,
            healthConfidence: found.healthConfidence,
            weeklyOutlook: found.weeklyOutlook ?? "",
          });
        } else {
          setH(null);
        }
      } catch {
        setH(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    if (!id || !h) return;
    setSaving(true);
    try {
      await api.patch(`/admin/horoscopes/${id}`, {
        ...form,
        weeklyOutlook: form.weeklyOutlook || null,
      });
      router.push("/horoscopes");
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    router.replace("/horoscopes");
    return null;
  }
  if (loading) return <div className="text-slate-400">Loading...</div>;
  if (!h) return <div className="text-slate-400">Horoscope not found.</div>;

  return (
    <div className="space-y-6">
      <Link href="/horoscopes" className="text-sm text-purple-400 hover:text-purple-300">
        ← Horoscopes
      </Link>
      <h1 className="text-2xl font-semibold">Edit: {h.zodiacSign} · {h.date}</h1>
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            value={form.title ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-purple-500/30 bg-purple-900/10 px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Summary</label>
          <textarea
            value={form.summary ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            rows={2}
            className="mt-1 w-full rounded-lg border border-purple-500/30 bg-purple-900/10 px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Wealth</label>
          <textarea
            value={form.wealthText ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, wealthText: e.target.value }))}
            rows={2}
            className="mt-1 w-full rounded-lg border border-purple-500/30 bg-purple-900/10 px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Love</label>
          <textarea
            value={form.loveText ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, loveText: e.target.value }))}
            rows={2}
            className="mt-1 w-full rounded-lg border border-purple-500/30 bg-purple-900/10 px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Health</label>
          <textarea
            value={form.healthText ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, healthText: e.target.value }))}
            rows={2}
            className="mt-1 w-full rounded-lg border border-purple-500/30 bg-purple-900/10 px-3 py-2"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-primary px-4 py-2 font-medium hover:bg-purple-500 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
