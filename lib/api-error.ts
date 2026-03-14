export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function handleApiError(err: unknown): { status: number; message: string } {
  if (err instanceof ApiError) {
    return { status: err.statusCode, message: err.message };
  }
  const msg = err instanceof Error ? err.message : "Unexpected server error.";
  const code = (err as NodeJS.ErrnoException)?.code;
  const lower = msg.toLowerCase();
  // Log server-side for Vercel/debugging (check Project → Logs)
  console.error("[api-error]", msg, code ?? "");
  if (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    lower.includes("enotfound") ||
    lower.includes("econnrefused") ||
    lower.includes("connect econnrefused") ||
    lower.includes("tenant or user not found") ||
    lower.includes("connection terminated") ||
    lower.includes("database not configured")
  ) {
    return {
      status: 503,
      message:
        "Database unavailable. Set DATABASE_URL (and DATABASE_URL_POOLER on Vercel) in Environment Variables and ensure Supabase project is not paused.",
    };
  }
  return { status: 500, message: msg };
}
