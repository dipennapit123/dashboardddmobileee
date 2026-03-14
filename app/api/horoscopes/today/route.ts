import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/user-auth";
import { getCurrentUser } from "@/lib/user.service";
import { getLatestHoroscopeForZodiac } from "@/lib/horoscope-user.service";
import type { ZodiacSign } from "@/lib/types";
import { handleApiError } from "@/lib/api-error";

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

    const latest = await getLatestHoroscopeForZodiac(zodiacSign as ZodiacSign);

    if (!latest) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No horoscope available yet.",
      });
    }

    return NextResponse.json({ success: true, data: latest });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
