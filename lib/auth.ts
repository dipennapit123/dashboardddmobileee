import jwt from "jsonwebtoken";
import { env } from "./env";
import { ApiError } from "./api-error";
import { headers } from "next/headers";

export interface AdminJwtPayload {
  adminId: string;
  role: string;
}

export async function getAdminFromRequest(): Promise<AdminJwtPayload> {
  const h = await headers();
  const authHeader = h.get("authorization");
  const allowAnonymous =
    process.env.ALLOW_ANONYMOUS_ADMIN === "true" ||
    process.env.ALLOW_ANONYMOUS_ADMIN === "1";

  if (!authHeader?.startsWith("Bearer ")) {
    if (allowAnonymous) {
      return { adminId: "anonymous", role: "SUPER_ADMIN" };
    }
    throw new ApiError(401, "Missing admin authorization token.");
  }
  try {
    const token = authHeader.slice("Bearer ".length);
    const payload = jwt.verify(token, env.adminJwtSecret) as AdminJwtPayload;
    return payload;
  } catch {
    throw new ApiError(401, "Invalid or expired admin token.");
  }
}
