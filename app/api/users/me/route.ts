import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/user-auth";
import { getCurrentUser } from "@/lib/user.service";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const clerkUserId = await getUserIdFromRequest();
    const user = await getCurrentUser(clerkUserId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "User not found." } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
