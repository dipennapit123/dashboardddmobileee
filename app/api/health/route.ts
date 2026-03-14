import { NextResponse } from "next/server";
import { ping } from "@/lib/db";

export async function GET() {
  let database: "connected" | "disconnected" = "disconnected";
  try {
    await ping();
    database = "connected";
  } catch {
    // leave as disconnected
  }
  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? undefined;
  return NextResponse.json({
    success: true,
    data: {
      status: "ok",
      database,
      deployCommit: commit,
      message:
        database === "connected"
          ? "Database connected; horoscopes and user data will be served."
          : "Database not connected; set DATABASE_URL.",
    },
  });
}
