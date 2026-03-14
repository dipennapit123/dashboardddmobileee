import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setupFirstAdmin } from "@/lib/admin-auth.service";
import { handleApiError } from "@/lib/api-error";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid setup payload. Need email and password (min 6 chars)." } },
        { status: 400 }
      );
    }
    const { email, password, name } = parsed.data;
    const { token, admin } = await setupFirstAdmin(email, password, name ?? "Admin");
    return NextResponse.json({ success: true, data: { token, admin } });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
