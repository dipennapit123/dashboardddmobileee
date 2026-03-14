import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { publishHoroscope } from "@/lib/admin-horoscope.service";
import { handleApiError } from "@/lib/api-error";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminFromRequest();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const isPublished =
      typeof body.isPublished === "boolean"
        ? body.isPublished
        : body.isPublished === "true";
    const updated = await publishHoroscope(id, isPublished);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
