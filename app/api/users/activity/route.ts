import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/user-auth";
import { recordActivity } from "@/lib/user.service";
import { handleApiError } from "@/lib/api-error";

const bodySchema = z.object({
  action: z.enum(["APP_OPEN", "HOROSCOPE_VIEW", "ZODIAC_SELECTED", "SETTINGS_VIEW"]),
  sessionId: z.string().optional(),
  timezone: z.string().optional(),
  platform: z.string().optional(),
  appVersion: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const clerkUserId = await getUserIdFromRequest();
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid activity payload." } },
        { status: 400 }
      );
    }
    const activity = await recordActivity(clerkUserId, parsed.data.action, {
      sessionId: parsed.data.sessionId,
      timezone: parsed.data.timezone,
      platform: parsed.data.platform,
      appVersion: parsed.data.appVersion,
    });
    return NextResponse.json({ success: true, data: activity });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
