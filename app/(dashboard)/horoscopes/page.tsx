"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "@/lib/api-client";
import type { ZodiacSign } from "@/lib/types";

dayjs.extend(relativeTime);

const ZODIAC_SIGNS: ZodiacSign[] = [
  "ARIES", "TAURUS", "GEMINI", "CANCER", "LEO", "VIRGO",
  "LIBRA", "SCORPIO", "SAGITTARIUS", "CAPRICORN", "AQUARIUS", "PISCES",
];

const zodiacInitial: Record<string, string> = {
  ARIES: "A", TAURUS: "T", GEMINI: "G", CANCER: "C", LEO: "L", VIRGO: "V",
  LIBRA: "L", SCORPIO: "S", SAGITTARIUS: "S", CAPRICORN: "C", AQUARIUS: "A", PISCES: "P",
};

interface Horoscope {
  id: string;
  zodiacSign: string;
  date: string;
  title: string;
  summary: string;
  wealthText?: string;
  loveText?: string;
  healthText?: string;
  weeklyOutlook?: string;
  isPublished: boolean;
  updatedAt?: string;
}

const PAGE_SIZE = 12;

export default function HoroscopesPage() {
  const [items, setItems] = useState<Horoscope[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewItem, setViewItem] = useState<Horoscope | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [zodiacFilter, setZodiacFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [publishAllLoading, setPublishAllLoading] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [deleteByDateLoading, setDeleteByDateLoading] = useState(false);
  const loadRef = useRef(0);

  const load = useCallback(async (p?: number) => {
    const id = ++loadRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p ?? page));
      params.set("pageSize", String(PAGE_SIZE));
      if (zodiacFilter) params.set("zodiacSign", zodiacFilter);
      if (dateFilter) params.set("date", dateFilter);
      if (statusFilter === "published") params.set("isPublished", "true");
      if (statusFilter === "draft") params.set("isPublished", "false");
      if (search) params.set("search", search);
      const res = await api.get<Horoscope[]>(`/admin/horoscopes?${params}`);
      if (loadRef.current !== id) return;
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      if (loadRef.current === id) setItems([]);
    } finally {
      if (loadRef.current === id) setLoading(false);
    }
  }, [page, zodiacFilter, dateFilter, statusFilter, search]);

  useEffect(() => {
    load();
  }, [page, statusFilter]);

  const handleApplyFilters = useCallback(() => {
    setPage(1);
    load(1);
  }, [load]);

  const handleTogglePublish = useCallback(async (id: string, isPublished: boolean) => {
    await api.patch(`/admin/horoscopes/${id}/publish`, { isPublished });
    load();
  }, [load]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this horoscope?")) return;
    await api.delete(`/admin/horoscopes/${id}`);
    load();
  }, [load]);

  const handlePublishAll = useCallback(async () => {
    if (!confirm("Publish all draft horoscopes?")) return;
    setPublishAllLoading(true);
    try {
      const res = await api.post<{ count?: number }>("/admin/horoscopes/publish-all");
      const count = (res as { count?: number }).count ?? 0;
      alert(count > 0 ? `Published ${count} horoscope(s).` : "No drafts to publish.");
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to publish all.");
    } finally {
      setPublishAllLoading(false);
    }
  }, [load]);

  const handleDeleteAll = useCallback(async () => {
    if (!confirm("Delete ALL horoscopes? This cannot be undone.")) return;
    setDeleteAllLoading(true);
    try {
      const res = await api.post<{ count?: number }>("/admin/horoscopes/delete-all");
      const count = (res as { count?: number }).count ?? 0;
      alert(count > 0 ? `Deleted ${count} horoscope(s).` : "No horoscopes to delete.");
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete all.");
    } finally {
      setDeleteAllLoading(false);
    }
  }, [load]);

  const handleDeleteByDate = useCallback(async () => {
    if (!dateFilter) {
      alert("Select a date first using the date filter above.");
      return;
    }
    if (!confirm(`Delete all horoscopes for ${dayjs(dateFilter).format("MMM D, YYYY")}?`)) return;
    setDeleteByDateLoading(true);
    try {
      const res = await api.post<{ count?: number }>("/admin/horoscopes/delete-by-date", { date: dateFilter });
      const count = (res as { count?: number }).count ?? 0;
      alert(count > 0 ? `Deleted ${count} horoscope(s) for ${dayjs(dateFilter).format("MMM D, YYYY")}.` : "No horoscopes found for that date.");
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete by date.");
    } finally {
      setDeleteByDateLoading(false);
    }
  }, [dateFilter, load]);

  const handleView = useCallback(async (id: string) => {
    setViewLoading(true);
    try {
      const res = await api.get<Horoscope>(`/admin/horoscopes/${id}`);
      setViewItem(res.data);
    } catch {
      const found = items.find((i) => i.id === id);
      if (found) setViewItem(found);
    } finally {
      setViewLoading(false);
    }
  }, [items]);

  const start = items.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = (page - 1) * PAGE_SIZE + items.length;
  const hasMore = items.length >= PAGE_SIZE;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col text-slate-100">
      <header className="mb-6 flex flex-col gap-4 border-b border-purple-900/40 pb-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-bold">Horoscopes</h2>
        <div className="flex items-center gap-3">
          <div className="relative hidden w-64 md:block">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              placeholder="Search entries..."
              className="w-full rounded-full bg-purple-950/40 py-2 pl-10 pr-4 text-sm outline-none ring-1 ring-purple-900/60 placeholder:text-slate-500 focus:ring-primary/70"
            />
          </div>
          <Link
            href="/generate"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Create New
          </Link>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full border border-purple-900/60 bg-purple-950/40 px-3 py-1.5">
            <span className="material-symbols-outlined mr-2 text-sm text-slate-400">
              calendar_today
            </span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-28 border-none bg-transparent p-0 text-sm text-slate-200 outline-none"
            />
          </div>
          <select
            value={zodiacFilter}
            onChange={(e) => setZodiacFilter(e.target.value)}
            className="min-w-[140px] appearance-none rounded-full border border-purple-900/60 bg-purple-950/40 px-4 py-1.5 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Zodiacs</option>
            {ZODIAC_SIGNS.map((z) => (
              <option key={z} value={z}>
                {z.charAt(0) + z.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <div className="mx-1 h-6 w-px bg-purple-900/40" />
          <div className="flex rounded-full bg-purple-900/30 p-1">
            {(["all", "draft", "published"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-4 py-1 text-xs font-bold capitalize transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-400 hover:text-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <Link
          href="/generate"
          className="flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
        >
          <span className="material-symbols-outlined text-sm">auto_fix_high</span>
          Generate with AI
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setZodiacFilter("");
            setDateFilter("");
            setStatusFilter("all");
            setPage(1);
          }}
          className="rounded-full border border-purple-500/50 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-purple-900/40"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleApplyFilters}
          className="rounded-full bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white"
        >
          Apply
        </button>
        <div className="mx-2 h-5 w-px bg-purple-700/50" />
        <button
          type="button"
          disabled={publishAllLoading}
          onClick={handlePublishAll}
          className="flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">publish</span>
          {publishAllLoading ? "Publishing…" : "Publish all"}
        </button>
        <button
          type="button"
          disabled={deleteByDateLoading || !dateFilter}
          onClick={handleDeleteByDate}
          className="flex items-center gap-1.5 rounded-full border border-orange-500/50 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/20 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">event_busy</span>
          {deleteByDateLoading ? "Deleting…" : `Delete by date${dateFilter ? ` (${dayjs(dateFilter).format("MMM D")})` : ""}`}
        </button>
        <button
          type="button"
          disabled={deleteAllLoading}
          onClick={handleDeleteAll}
          className="flex items-center gap-1.5 rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">delete_forever</span>
          {deleteAllLoading ? "Deleting…" : "Delete all"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-purple-900/60 bg-purple-950/40 shadow-lg shadow-purple-950/30">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 w-full animate-pulse rounded-lg bg-purple-900/40"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No horoscopes found for the current filters.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-purple-900/60 bg-purple-950/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Zodiac Sign</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Last Edited</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/40">
                  {items.map((h) => (
                    <tr
                      key={h.id}
                      className="transition-colors hover:bg-purple-900/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {dayjs(h.date).format("MMM D, YYYY")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                            {zodiacInitial[h.zodiacSign] ?? "—"}
                          </span>
                          <span className="font-medium">
                            {h.zodiacSign.charAt(0) + h.zodiacSign.slice(1).toLowerCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{h.title}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            h.isPublished
                              ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                              : "border-slate-500/30 bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {h.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {h.updatedAt ? dayjs(h.updatedAt).fromNow() : "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end gap-3 text-xs font-bold text-primary">
                          <button
                            type="button"
                            onClick={() => handleView(h.id)}
                            className="hover:underline"
                          >
                            View
                          </button>
                          <Link href={`/horoscopes/${h.id}`} className="hover:underline">
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(h.id, !h.isPublished)}
                            className="hover:underline"
                          >
                            {h.isPublished ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(h.id)}
                            className="text-red-400 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-purple-900/40 bg-purple-950/60 px-6 py-4">
              <span className="text-xs text-slate-500">
                Showing {start} to {end}
                {hasMore ? "+" : ""} of {hasMore ? "many" : end} entries
              </span>
              <div className="flex items-center gap-2">
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
                  disabled={!hasMore}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full border border-purple-900/60 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {(viewItem || viewLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => { setViewItem(null); }}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-purple-500/30 bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {viewLoading && !viewItem ? (
              <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : viewItem ? (
              <>
                <div className="flex shrink-0 items-center justify-between border-b border-purple-500/20 p-4">
                  <div>
                    <h3 className="text-lg font-semibold">{viewItem.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {viewItem.zodiacSign.charAt(0) + viewItem.zodiacSign.slice(1).toLowerCase()} &bull; {dayjs(viewItem.date).format("MMM D, YYYY")}
                      <span className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${viewItem.isPublished ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>
                        {viewItem.isPublished ? "Published" : "Draft"}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-2xl leading-none text-muted-foreground hover:text-foreground"
                    onClick={() => setViewItem(null)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
                <div className="space-y-5 overflow-y-auto p-6">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Summary</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{viewItem.summary}</p>
                  </div>
                  {viewItem.wealthText && (
                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-purple-400">Wealth</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{viewItem.wealthText}</p>
                    </div>
                  )}
                  {viewItem.loveText && (
                    <div className="rounded-xl border border-pink-500/20 bg-pink-500/10 p-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-pink-400">Love</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{viewItem.loveText}</p>
                    </div>
                  )}
                  {viewItem.healthText && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-400">Health</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{viewItem.healthText}</p>
                    </div>
                  )}
                  {viewItem.weeklyOutlook && (
                    <div className="rounded-xl border border-purple-500/20 bg-muted/60 p-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Weekly Outlook</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{viewItem.weeklyOutlook}</p>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center justify-end gap-3 border-t border-purple-500/20 px-4 py-3">
                  <Link
                    href={`/horoscopes/${viewItem.id}`}
                    className="rounded-full bg-primary/20 px-4 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setViewItem(null)}
                    className="rounded-full border border-purple-500/30 px-4 py-1.5 text-xs font-medium text-slate-300 hover:bg-purple-900/40"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
