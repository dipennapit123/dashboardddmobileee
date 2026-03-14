import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { getDashboardStats } from "@/lib/admin-horoscope.service";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    await getAdminFromRequest();
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
