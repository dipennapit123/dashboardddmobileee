export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const DB_UNAVAILABLE_MSG =
  "Database unavailable. Set DATABASE_URL (and DATABASE_URL_POOLER on Vercel) in Environment Variables and ensure Supabase project is not paused.";

function isDbConnectionError(msg: string, code: string | undefined): boolean {
  const lower = msg.toLowerCase();
  const dbPatterns = [
    "enotfound", "econnrefused", "econnreset", "etimedout", "connect econnrefused",
    "tenant or user not found", "connection terminated", "database not configured",
    "getaddrinfo", "socket hang up", "connection refused", "connect etimedout",
    "ssl", "certificate", "self-signed",
  ];
  if (code && ["ECONNREFUSED", "ENOTFOUND", "ECONNRESET", "ETIMEDOUT"].includes(code)) return true;
  return dbPatterns.some((p) => lower.includes(p));
}

export function handleApiError(err: unknown): { status: number; message: string } {
  if (err instanceof ApiError) {
    return { status: err.statusCode, message: err.message };
  }
  const msg = err instanceof Error ? err.message : "Unexpected server error.";
  const code = (err as NodeJS.ErrnoException)?.code;
  const fullStr = String(err);
  // Log full error server-side so Vercel/debugging shows the real cause (Project → Logs)
  console.error("[api-error] message=", msg, "code=", code ?? "(none)", "full=", fullStr);
  if (err instanceof Error && err.stack) {
    console.error("[api-error] stack:", err.stack);
  }
  if (isDbConnectionError(msg, code) || isDbConnectionError(fullStr, code)) {
    return { status: 503, message: DB_UNAVAILABLE_MSG };
  }
  return { status: 500, message: msg };
}
