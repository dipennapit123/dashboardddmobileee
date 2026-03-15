import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/user-auth";
import { getCurrentUser } from "@/lib/user.service";
import { getHoroscopeHistoryForZodiac } from "@/lib/horoscope-user.service";
import type { ZodiacSign } from "@/lib/types";
import { handleApiError } from "@/lib/api-error";

/** Map DB row to the shape expected by the mobile app (date as ISO string). */
function toMobileHoroscope(row: Record<string, unknown>) {
  const date = row.date instanceof Date ? row.date : new Date((row.date as string) ?? "");
  return {
    id: row.id,
    zodiacSign: row.zodiacSign,
    date: date.toISOString(),
    title: row.title,
    summary: row.summary,
    wealthText: row.wealthText,
    loveText: row.loveText,
    healthText: row.healthText,
    wealthConfidence: Number(row.wealthConfidence) ?? 70,
    loveConfidence: Number(row.loveConfidence) ?? 70,
    healthConfidence: Number(row.healthConfidence) ?? 70,
    wealthActionLabel: row.wealthActionLabel ?? null,
    loveActionLabel: row.loveActionLabel ?? null,
    healthActionLabel: row.healthActionLabel ?? null,
    weeklyOutlook: row.weeklyOutlook ?? null,
  };
}

export async function GET() {
  try {
    const clerkUserId = await getUserIdFromRequest();
    const user = await getCurrentUser(clerkUserId);
    const zodiacSign = user && (user as { zodiacSign?: string }).zodiacSign;

    if (!zodiacSign) {
      return NextResponse.json(
        { success: false, error: { message: "User zodiac sign not set." } },
        { status: 400 }
      );
    }

    const rows = await getHoroscopeHistoryForZodiac(zodiacSign as ZodiacSign);
    const data = rows.map((row) => toMobileHoroscope(row as unknown as Record<string, unknown>));
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = (err as NodeJS.ErrnoException)?.code;
    console.error("[horoscopes/history] GET failed:", msg, "code=", code ?? "(none)");
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
