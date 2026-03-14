import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { listUsers } from "@/lib/admin-users.service";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await getAdminFromRequest();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined;
    const pageSize = searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined;
    const data = await listUsers({ page, pageSize });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
