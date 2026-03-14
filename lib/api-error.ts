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
  if (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    lower.includes("enotfound") ||
    lower.includes("econnrefused") ||
    lower.includes("connect econnrefused")
  ) {
    return {
      status: 503,
      message:
        "Database unavailable. Check DATABASE_URL and that the database host is reachable (e.g. Supabase project not paused).",
    };
  }
  return { status: 500, message: msg };
}
