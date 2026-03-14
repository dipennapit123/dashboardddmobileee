import { Pool } from "pg";

const isVercel = process.env.VERCEL === "1";

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
    if (url.trim() && !url.startsWith("${{")) urls.push(url.trim());
  };

  // On Vercel, prefer pooler first (recommended for serverless)
  if (isVercel && pooler) add(pooler);
  if (primary) add(primary);
  if (!isVercel && pooler) add(pooler);

  return urls;
}

let _pool: Pool | null = null;
let _currentUrl: string | null = null;

function createPool(url: string): Pool {
  const max = isVercel ? 2 : 5;
  return new Pool({
    connectionString: url,
    max,
    idleTimeoutMillis: isVercel ? 10000 : 20000,
    connectionTimeoutMillis: 6000,
    ssl: { rejectUnauthorized: false },
  });
}

export function getPool(): Pool | null {
  if (_pool) return _pool;
  const urls = getDatabaseUrls();
  if (urls.length === 0) return null;
  _currentUrl = urls[0];
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
    throw new Error(
      "Database not configured: set DATABASE_URL or DATABASE_URL_POOLER."
    );
  }

  try {
    const result = await p.query(text, values);
    return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : String(err);
    const isConnectionError =
      msg.includes("ENOTFOUND") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("Tenant or user not found") ||
      msg.includes("connection terminated") ||
      msg.includes("timeout");

    if (!isConnectionError) throw err;

    console.warn(`[db] Primary connection failed (${msg}), trying fallback…`);

    const urls = getDatabaseUrls();
    for (const url of urls) {
      if (url === _currentUrl) continue;
      try {
        console.log(`[db] Trying fallback: ${url.replace(/:[^:@]+@/, ':***@')}`);
        const newPool = await tryConnect(url);
        // Fallback works — swap it in
        await _pool?.end().catch(() => {});
        _pool = newPool;
        _currentUrl = url;
        const result = await _pool.query(text, values);
        return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
      } catch (fallbackErr) {
        const fbMsg =
          fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        console.warn(`[db] Fallback also failed: ${fbMsg}`);
      }
    }

    throw err;
  }
}

export async function ping(): Promise<void> {
  const { rows } = await query<{ "?column?": number }>("SELECT 1");
  if (!rows.length) throw new Error("Database ping returned no rows");
}
