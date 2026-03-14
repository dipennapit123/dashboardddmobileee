import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginAdmin } from "@/lib/admin-auth.service";
import { handleApiError } from "@/lib/api-error";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid login payload." } },
        { status: 400 }
      );
    }
    const { token, admin } = await loginAdmin(parsed.data.email, parsed.data.password);
    return NextResponse.json({ success: true, data: { token, admin } });
  } catch (err) {
    const { status, message } = handleApiError(err);
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
