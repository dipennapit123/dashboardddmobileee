import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/user-auth";
import { updateUserZodiac } from "@/lib/user.service";
import { handleApiError } from "@/lib/api-error";

const bodySchema = z.object({
  zodiacSign: z.enum([
    "ARIES", "TAURUS", "GEMINI", "CANCER", "LEO", "VIRGO",
    "LIBRA", "SCORPIO", "SAGITTARIUS", "CAPRICORN", "AQUARIUS", "PISCES",
  ]),
});

export async function PATCH(request: NextRequest) {
  try {
    const clerkUserId = await getUserIdFromRequest();
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid zodiac payload." } },
        { status: 400 }
      );
    }
    const updated = await updateUserZodiac(clerkUserId, parsed.data.zodiacSign);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
