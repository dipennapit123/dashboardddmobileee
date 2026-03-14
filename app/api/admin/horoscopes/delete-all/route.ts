import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { deleteAllHoroscopes } from "@/lib/admin-horoscope.service";
import { handleApiError } from "@/lib/api-error";

export async function POST() {
  try {
    await getAdminFromRequest();
    const { count } = await deleteAllHoroscopes();
    return NextResponse.json({ success: true, count });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
