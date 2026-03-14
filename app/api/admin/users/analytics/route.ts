import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { getUserAnalytics } from "@/lib/admin-users.service";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    await getAdminFromRequest();
    const data = await getUserAnalytics();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
