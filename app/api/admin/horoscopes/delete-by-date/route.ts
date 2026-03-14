import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { deleteHoroscopesByDate } from "@/lib/admin-horoscope.service";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    await getAdminFromRequest();
    const body = await request.json().catch(() => ({}));
    const dateStr = body.date as string | undefined;
    if (!dateStr) {
      return NextResponse.json(
        { success: false, error: { message: "date is required (YYYY-MM-DD)." } },
        { status: 400 }
      );
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid date format." } },
        { status: 400 }
      );
    }
    const { count } = await deleteHoroscopesByDate(date);
    return NextResponse.json({ success: true, count, date: dateStr });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
