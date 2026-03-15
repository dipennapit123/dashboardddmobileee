import { Pool } from "pg";

const isVercel = process.env.VERCEL === "1";

/** If URL is Supabase pooler host but port 5432, return same URL with port 6543 (Session pooler port). */
function ensurePoolerPort(url: string): string {
  if (!url.includes("pooler.supabase.com")) return url;
  // Supabase Session pooler uses 6543; 5432 on pooler host often fails from serverless
  if (url.includes(":5432/")) return url.replace(":5432/", ":6543/");
  return url;
}

function getDatabaseUrls(): string[] {
  const primary =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_PRIVATE_URL ||
    process.env.DATABASE_PUBLIC_URL ||
    process.env.POSTGRES_URL ||
    "";
  const pooler = process.env.DATABASE_URL_POOLER || "";

  const urls: string[] = [];
  const add = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed || trimmed.startsWith("${{")) return;
    // Supabase pooler with 5432 fails from serverless; try 6543 first
    if (trimmed.includes("pooler.supabase.com") && trimmed.includes(":5432/")) {
      urls.push(ensurePoolerPort(trimmed));
    }
    urls.push(trimmed);
  };

  // On Vercel, prefer pooler first (recommended for serverless; use port 6543 for Supabase Session pooler)
  if (isVercel && pooler) add(pooler);
  if (primary) add(primary);
  if (!isVercel && pooler) add(pooler);

  // Dedupe so we don't try same URL twice (e.g. primary and pooler were same)
  return [...new Set(urls)];
}

/** True if this error should trigger trying the next connection URL (fallback). */
function isConnectionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const code = (err as NodeJS.ErrnoException)?.code;
  const lower = msg.toLowerCase();
  if (code && ["ECONNREFUSED", "ENOTFOUND", "ECONNRESET", "ETIMEDOUT"].includes(code)) return true;
  return (
    lower.includes("enotfound") ||
    lower.includes("econnrefused") ||
    lower.includes("econnreset") ||
    lower.includes("etimedout") ||
    lower.includes("tenant or user not found") ||
    lower.includes("connection terminated") ||
    lower.includes("timeout") ||
    lower.includes("socket hang up") ||
    lower.includes("getaddrinfo") ||
    lower.includes("connection refused")
  );
}

function maskUrl(url: string): string {
  return url.replace(/:[^:@]+@/, ":****@");
}

let _pool: Pool | null = null;
let _currentUrl: string | null = null;

function createPool(url: string): Pool {
  const max = isVercel ? 2 : 5;
  const connectionTimeoutMillis = isVercel ? 10000 : 6000;
  return new Pool({
    connectionString: url,
    max,
    idleTimeoutMillis: isVercel ? 10000 : 20000,
    connectionTimeoutMillis,
    ssl: { rejectUnauthorized: false },
  });
}

export function getPool(): Pool | null {
  if (_pool) return _pool;
  const urls = getDatabaseUrls();
  if (urls.length === 0) {
    console.error("[db] No DATABASE_URL or DATABASE_URL_POOLER set. Set env in Vercel → Settings → Environment Variables.");
    return null;
  }
  _currentUrl = urls[0];
  if (isVercel) {
    console.log("[db] Using URL (masked):", maskUrl(_currentUrl), "poolerFirst=", !!process.env.DATABASE_URL_POOLER);
  }
  _pool = createPool(_currentUrl);
  return _pool;
}

async function tryConnect(url: string): Promise<Pool> {
  const pool = createPool(url);
  await pool.query("SELECT 1");
  return pool;
}

export async function query<T = unknown>(
  text: string,
  values?: unknown[]
): Promise<{ rows: T[]; rowCount: number }> {
  let p = getPool();
  if (!p) {
    const msg = "Database not configured: set DATABASE_URL or DATABASE_URL_POOLER.";
    console.error("[db]", msg);
    throw new Error(msg);
  }

  try {
    const result = await p.query(text, values);
    return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = (err as NodeJS.ErrnoException)?.code;
    console.error("[db] Query failed message=", msg, "code=", code ?? "(none)");

    if (!isConnectionError(err)) throw err;

    console.warn("[db] Primary connection failed, trying fallback URLs…");

    const urls = getDatabaseUrls();
    for (const url of urls) {
      if (url === _currentUrl) continue;
      try {
        console.log("[db] Trying fallback:", maskUrl(url));
        const newPool = await tryConnect(url);
        await _pool?.end().catch(() => {});
        _pool = newPool;
        _currentUrl = url;
        const result = await _pool.query(text, values);
        return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
      } catch (fallbackErr) {
        const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        const fbCode = (fallbackErr as NodeJS.ErrnoException)?.code;
        console.warn("[db] Fallback failed:", fbMsg, "code=", fbCode ?? "(none)");
      }
    }

    console.error("[db] All connections failed. Original error:", msg, "code=", code);
    throw err;
  }
}

export async function ping(): Promise<void> {
  const { rows } = await query<{ "?column?": number }>("SELECT 1");
  if (!rows.length) throw new Error("Database ping returned no rows");
}
