import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { publishAllHoroscopes } from "@/lib/admin-horoscope.service";
import { handleApiError } from "@/lib/api-error";

export async function POST() {
  try {
    await getAdminFromRequest();
    const { count } = await publishAllHoroscopes();
    return NextResponse.json({ success: true, count });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
