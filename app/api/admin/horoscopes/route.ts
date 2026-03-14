import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminFromRequest } from "@/lib/auth";
import {
  listHoroscopes,
  createHoroscope,
} from "@/lib/admin-horoscope.service";
import type { ZodiacSign } from "@/lib/types";
import { handleApiError } from "@/lib/api-error";

const baseSchema = z.object({
  zodiacSign: z.enum([
    "ARIES", "TAURUS", "GEMINI", "CANCER", "LEO", "VIRGO",
    "LIBRA", "SCORPIO", "SAGITTARIUS", "CAPRICORN", "AQUARIUS", "PISCES",
  ]),
  date: z.string(),
  title: z.string(),
  summary: z.string(),
  wealthText: z.string(),
  loveText: z.string(),
  healthText: z.string(),
  wealthConfidence: z.number().int().min(0).max(100),
  loveConfidence: z.number().int().min(0).max(100),
  healthConfidence: z.number().int().min(0).max(100),
  wealthActionLabel: z.string().optional(),
  loveActionLabel: z.string().optional(),
  healthActionLabel: z.string().optional(),
  weeklyOutlook: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await getAdminFromRequest();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
    const dateStr = searchParams.get("date");
    const data = await listHoroscopes({
      zodiacSign: searchParams.get("zodiacSign") as ZodiacSign | undefined,
      isPublished:
        searchParams.get("isPublished") === "true"
          ? true
          : searchParams.get("isPublished") === "false"
            ? false
            : undefined,
      search: searchParams.get("search") ?? undefined,
      date: dateStr ? new Date(dateStr) : undefined,
      page,
      pageSize: 12,
    });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await getAdminFromRequest();
    const body = await request.json();
    const parsed = baseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid horoscope payload." } },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const created = await createHoroscope({
      zodiacSign: d.zodiacSign as ZodiacSign,
      date: new Date(d.date),
      title: d.title,
      summary: d.summary,
      wealthText: d.wealthText,
      loveText: d.loveText,
      healthText: d.healthText,
      wealthConfidence: d.wealthConfidence,
      loveConfidence: d.loveConfidence,
      healthConfidence: d.healthConfidence,
      wealthActionLabel: d.wealthActionLabel ?? null,
      loveActionLabel: d.loveActionLabel ?? null,
      healthActionLabel: d.healthActionLabel ?? null,
      weeklyOutlook: d.weeklyOutlook ?? null,
      isPublished: d.isPublished ?? false,
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
