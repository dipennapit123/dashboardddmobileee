"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { api } from "@/lib/api-client";
import { Card, Button, Input } from "@/components/ui";
import type { ZodiacSign } from "@/lib/types";

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  allZodiacs: z.boolean().optional(),
  zodiacSign: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const ZODIAC_OPTIONS: ZodiacSign[] = [
  "ARIES", "TAURUS", "GEMINI", "CANCER", "LEO", "VIRGO",
  "LIBRA", "SCORPIO", "SAGITTARIUS", "CAPRICORN", "AQUARIUS", "PISCES",
];

interface GeneratedItem {
  zodiacSign: ZodiacSign;
  id?: string;
  title: string;
  summary: string;
  wealthText: string;
  loveText: string;
  healthText: string;
  weeklyOutlook?: string;
}

export default function GeneratePage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: "",
      allZodiacs: true,
    },
  });

  // Set date on client only to avoid hydration mismatch (React #418)
  useEffect(() => {
    setValue("date", dayjs().format("YYYY-MM-DD"));
  }, [setValue]);
  const [previews, setPreviews] = useState<GeneratedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSign, setSelectedSign] = useState<string>("ALL");
  const [selectedDetail, setSelectedDetail] = useState<GeneratedItem | null>(null);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setPreviews([]);
    setIsGenerating(true);
    try {
      const res = await api.post<GeneratedItem[]>("/admin/horoscopes/generate", {
        date: values.date,
        allZodiacs: values.allZodiacs ?? true,
        zodiacSign: values.zodiacSign || undefined,
        notes: values.notes || undefined,
      });
      setPreviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate horoscopes. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Generate horoscopes
        </h1>
        <p className="text-sm text-muted-foreground">
          Draft multiple sign-specific entries using the mock generator.
        </p>
      </div>

      <Card className="space-y-4 p-6">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide">
                Zodiac sign
              </label>
              <select
                className="rounded-xl border border-purple-500/30 bg-muted/60 px-3 py-2 text-sm"
                {...register("zodiacSign")}
                disabled={watch("allZodiacs")}
              >
                <option value="">Select one</option>
                {ZODIAC_OPTIONS.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
              {errors.zodiacSign && (
                <p className="text-xs text-red-400">{errors.zodiacSign.message}</p>
              )}
            </div>
            <div className="flex flex-col justify-end space-y-1">
              <label className="inline-flex items-center gap-2 text-xs">
                <input type="checkbox" {...register("allZodiacs")} />
                Generate for all zodiac signs
              </label>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide">
                Date
              </label>
              <Input
                type="date"
                className="bg-white text-black"
                {...register("date")}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
              {error.includes("Database") && " Set DATABASE_URL in Vercel → Settings → Environment Variables and ensure Supabase is not paused."}
            </div>
          )}

          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </form>
      </Card>

      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Generated previews</h2>
            <select
              className="rounded-xl border border-purple-500/30 bg-muted/60 px-3 py-2 text-xs"
              value={selectedSign}
              onChange={(e) => setSelectedSign(e.target.value)}
            >
              <option value="ALL">All signs</option>
              {ZODIAC_OPTIONS.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {previews
              .filter((p) => selectedSign === "ALL" || p.zodiacSign === selectedSign)
              .map((p) => (
                <Card
                  key={p.zodiacSign}
                  className="cursor-pointer space-y-2 p-4 transition hover:border-purple-500/60 hover:bg-muted/40"
                  onClick={() => setSelectedDetail(p)}
                >
                  <p className="text-xs text-muted-foreground">
                    {p.zodiacSign} • {watch("date")}
                  </p>
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {p.summary}
                  </p>
                  <p className="pt-1 text-xs text-purple-400">View full details →</p>
                </Card>
              ))}
          </div>
        </div>
      )}

      {selectedDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedDetail(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-purple-500/30 bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-purple-500/20 p-4">
              <h3 className="text-lg font-semibold">
                {selectedDetail.zodiacSign} • {watch("date")}
              </h3>
              <button
                type="button"
                className="text-2xl leading-none text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedDetail(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="space-y-6 overflow-y-auto p-6">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Title
                </p>
                <p className="text-lg font-semibold">{selectedDetail.title}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Summary
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {selectedDetail.summary}
                </p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-purple-400">
                    Wealth
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedDetail.wealthText || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-pink-500/20 bg-pink-500/10 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-pink-400">
                    Love
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedDetail.loveText || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-400">
                    Health
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedDetail.healthText || "—"}
                  </p>
                </div>
              </div>
              {selectedDetail.weeklyOutlook && (
                <div className="rounded-xl border border-purple-500/20 bg-muted/60 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Weekly outlook
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedDetail.weeklyOutlook}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
