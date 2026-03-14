import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminFromRequest } from "@/lib/auth";
import {
  getHoroscopeById,
  updateHoroscope,
  deleteHoroscope,
} from "@/lib/admin-horoscope.service";
import type { ZodiacSign } from "@/lib/types";
import { handleApiError } from "@/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminFromRequest();
    const { id } = await params;
    const row = await getHoroscopeById(id);
    if (!row) {
      return NextResponse.json(
        { success: false, error: { message: "Horoscope not found." } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: row });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}

const partialSchema = z.object({
  zodiacSign: z.enum([
    "ARIES", "TAURUS", "GEMINI", "CANCER", "LEO", "VIRGO",
    "LIBRA", "SCORPIO", "SAGITTARIUS", "CAPRICORN", "AQUARIUS", "PISCES",
  ]).optional(),
  date: z.string().optional(),
  title: z.string().optional(),
  summary: z.string().optional(),
  wealthText: z.string().optional(),
  loveText: z.string().optional(),
  healthText: z.string().optional(),
  wealthConfidence: z.number().int().min(0).max(100).optional(),
  loveConfidence: z.number().int().min(0).max(100).optional(),
  healthConfidence: z.number().int().min(0).max(100).optional(),
  wealthActionLabel: z.string().optional(),
  loveActionLabel: z.string().optional(),
  healthActionLabel: z.string().optional(),
  weeklyOutlook: z.string().optional(),
  isPublished: z.boolean().optional(),
}).partial();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminFromRequest();
    const { id } = await params;
    const body = await request.json();
    const parsed = partialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid horoscope payload." } },
        { status: 400 }
      );
    }
    const payload = parsed.data;
    const updated = await updateHoroscope(id, {
      ...payload,
      date: payload.date ? new Date(payload.date) : undefined,
      zodiacSign: payload.zodiacSign as ZodiacSign | undefined,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminFromRequest();
    const { id } = await params;
    await deleteHoroscope(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
