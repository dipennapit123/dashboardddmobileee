import { randomUUID } from "crypto";
import type { ZodiacSign, HoroscopeRow } from "./types";
import { query } from "./db";
import { getGenerator } from "./generator";

export interface HoroscopeCreateInput {
  zodiacSign: ZodiacSign;
  date: Date;
  title: string;
  summary: string;
  wealthText: string;
  loveText: string;
  healthText: string;
  wealthConfidence: number;
  loveConfidence: number;
  healthConfidence: number;
  wealthActionLabel?: string | null;
  loveActionLabel?: string | null;
  healthActionLabel?: string | null;
  weeklyOutlook?: string | null;
  isPublished?: boolean;
}

export interface HoroscopeUpdateInput {
  zodiacSign?: ZodiacSign;
  date?: Date;
  title?: string;
  summary?: string;
  wealthText?: string;
  loveText?: string;
  healthText?: string;
  wealthConfidence?: number;
  loveConfidence?: number;
  healthConfidence?: number;
  wealthActionLabel?: string | null;
  loveActionLabel?: string | null;
  healthActionLabel?: string | null;
  weeklyOutlook?: string | null;
  isPublished?: boolean;
}

function buildListWhere(params: {
  zodiacSign?: ZodiacSign;
  date?: Date;
  isPublished?: boolean;
  search?: string;
}): { where: string; values: unknown[] } {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  if (params.zodiacSign) {
    conditions.push(`h."zodiacSign" = $${idx++}`);
    values.push(params.zodiacSign);
  }
  if (params.date) {
    conditions.push(`h.date::date = $${idx++}::date`);
    values.push(params.date.toISOString());
  }
  if (typeof params.isPublished === "boolean") {
    conditions.push(`h."isPublished" = $${idx++}`);
    values.push(params.isPublished);
  }
  if (params.search?.trim()) {
    conditions.push(`(h.title ILIKE $${idx} OR h.summary ILIKE $${idx})`);
    values.push(`%${params.search.trim()}%`);
    idx++;
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, values };
}

function mapHoroscopeRow(row: Record<string, unknown>): HoroscopeRow {
  return {
    id: row.id as string,
    zodiacSign: row.zodiacSign as ZodiacSign,
    date: row.date instanceof Date ? row.date : new Date(row.date as string),
    title: row.title as string,
    summary: row.summary as string,
    wealthText: row.wealthText as string,
    loveText: row.loveText as string,
    healthText: row.healthText as string,
    wealthConfidence: Number(row.wealthConfidence),
    loveConfidence: Number(row.loveConfidence),
    healthConfidence: Number(row.healthConfidence),
    wealthActionLabel: row.wealthActionLabel as string | null,
    loveActionLabel: row.loveActionLabel as string | null,
    healthActionLabel: row.healthActionLabel as string | null,
    weeklyOutlook: row.weeklyOutlook as string | null,
    isPublished: Boolean(row.isPublished),
    createdById: row.createdById as string | null,
    updatedById: row.updatedById as string | null,
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt as string),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt as string),
  };
}

export async function getHoroscopeById(id: string): Promise<HoroscopeRow | null> {
  const r = await query<HoroscopeRow>('SELECT * FROM "Horoscope" WHERE id = $1', [id]);
  const row = r.rows[0];
  if (!row) return null;
  return mapHoroscopeRow(row as unknown as Record<string, unknown>);
}

export async function listHoroscopes(params: {
  zodiacSign?: ZodiacSign;
  date?: Date;
  isPublished?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const take = params.pageSize && params.pageSize > 0 ? params.pageSize : 12;
  const skip = (page - 1) * take;
  const { where, values } = buildListWhere(params);
  const orderOffset = values.length + 1;
  const r = await query<HoroscopeRow>(
    `SELECT h.* FROM "Horoscope" h ${where}
     ORDER BY h.date DESC
     LIMIT $${orderOffset} OFFSET $${orderOffset + 1}`,
    [...values, take, skip]
  );
  return r.rows.map((row) => mapHoroscopeRow(row as unknown as Record<string, unknown>));
}

export async function createHoroscope(
  data: HoroscopeCreateInput
): Promise<HoroscopeRow> {
  const id = randomUUID();
  const now = new Date().toISOString();
  await query(
    `INSERT INTO "Horoscope" (
      id, "zodiacSign", date, title, summary,
      "wealthText", "loveText", "healthText",
      "wealthConfidence", "loveConfidence", "healthConfidence",
      "wealthActionLabel", "loveActionLabel", "healthActionLabel",
      "weeklyOutlook", "isPublished", "createdAt", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
      $12, $13, $14, $15, $16, $17, $17
    )`,
    [
      id, data.zodiacSign, data.date.toISOString(), data.title, data.summary,
      data.wealthText, data.loveText, data.healthText,
      data.wealthConfidence, data.loveConfidence, data.healthConfidence,
      data.wealthActionLabel ?? null, data.loveActionLabel ?? null, data.healthActionLabel ?? null,
      data.weeklyOutlook ?? null, data.isPublished ?? false, now,
    ]
  );
  const r = await query<HoroscopeRow>('SELECT * FROM "Horoscope" WHERE id = $1', [id]);
  const row = r.rows[0];
  if (!row) throw new Error("Horoscope create failed");
  return mapHoroscopeRow(row as unknown as Record<string, unknown>);
}

export async function updateHoroscope(
  id: string,
  data: HoroscopeUpdateInput
): Promise<HoroscopeRow> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  const set = (col: string, val: unknown) => {
    updates.push(`"${col}" = $${idx++}`);
    values.push(val);
  };
  if (data.zodiacSign !== undefined) set("zodiacSign", data.zodiacSign);
  if (data.date !== undefined) set("date", data.date.toISOString());
  if (data.title !== undefined) set("title", data.title);
  if (data.summary !== undefined) set("summary", data.summary);
  if (data.wealthText !== undefined) set("wealthText", data.wealthText);
  if (data.loveText !== undefined) set("loveText", data.loveText);
  if (data.healthText !== undefined) set("healthText", data.healthText);
  if (data.wealthConfidence !== undefined) set("wealthConfidence", data.wealthConfidence);
  if (data.loveConfidence !== undefined) set("loveConfidence", data.loveConfidence);
  if (data.healthConfidence !== undefined) set("healthConfidence", data.healthConfidence);
  if (data.wealthActionLabel !== undefined) set("wealthActionLabel", data.wealthActionLabel);
  if (data.loveActionLabel !== undefined) set("loveActionLabel", data.loveActionLabel);
  if (data.healthActionLabel !== undefined) set("healthActionLabel", data.healthActionLabel);
  if (data.weeklyOutlook !== undefined) set("weeklyOutlook", data.weeklyOutlook);
  if (data.isPublished !== undefined) set("isPublished", data.isPublished);
  if (updates.length === 0) {
    const r = await query<HoroscopeRow>('SELECT * FROM "Horoscope" WHERE id = $1', [id]);
    const row = r.rows[0];
    if (!row) throw new Error("Horoscope not found");
    return mapHoroscopeRow(row as unknown as Record<string, unknown>);
  }
  set("updatedAt", new Date().toISOString());
  values.push(id);
  await query(
    `UPDATE "Horoscope" SET ${updates.join(", ")} WHERE id = $${idx}`,
    values
  );
  const r = await query<HoroscopeRow>('SELECT * FROM "Horoscope" WHERE id = $1', [id]);
  const row = r.rows[0];
  if (!row) throw new Error("Horoscope not found");
  return mapHoroscopeRow(row as unknown as Record<string, unknown>);
}

export async function deleteHoroscope(id: string) {
  await query('DELETE FROM "Horoscope" WHERE id = $1', [id]);
}

export async function publishHoroscope(
  id: string,
  isPublished: boolean
): Promise<HoroscopeRow> {
  await query(
    `UPDATE "Horoscope" SET "isPublished" = $1, "updatedAt" = $2 WHERE id = $3`,
    [isPublished, new Date().toISOString(), id]
  );
  const r = await query<HoroscopeRow>('SELECT * FROM "Horoscope" WHERE id = $1', [id]);
  const row = r.rows[0];
  if (!row) throw new Error("Horoscope not found");
  return mapHoroscopeRow(row as unknown as Record<string, unknown>);
}

export async function publishAllHoroscopes(): Promise<{ count: number }> {
  const now = new Date().toISOString();
  const r = await query(
    `UPDATE "Horoscope" SET "isPublished" = true, "updatedAt" = $1 WHERE "isPublished" = false`,
    [now]
  );
  return { count: Number(r.rowCount) || 0 };
}

export async function deleteAllHoroscopes(): Promise<{ count: number }> {
  const r = await query<{ count: string }>('SELECT COUNT(*)::text as count FROM "Horoscope"');
  const count = parseInt(r.rows[0]?.count ?? "0", 10);
  if (count === 0) return { count: 0 };
  await query('DELETE FROM "Horoscope"');
  return { count };
}

export async function deleteHoroscopesByDate(date: Date): Promise<{ count: number }> {
  const dateStr = date.toISOString().slice(0, 10);
  const r = await query(
    `DELETE FROM "Horoscope" WHERE date::date = $1::date`,
    [dateStr]
  );
  return { count: Number(r.rowCount) || 0 };
}

export async function generateHoroscopeContent(input: {
  zodiacSign: ZodiacSign;
  date: Date;
  tone: "mystical" | "modern" | "friendly" | "premium";
  notes?: string;
}) {
  return getGenerator().generate(input);
}

export async function getDashboardStats() {
  const r = await query<{
    total: string;
    published: string;
    draft: string;
    users: string;
  }>(`
    SELECT
      (SELECT COUNT(*) FROM "Horoscope")::text AS total,
      (SELECT COUNT(*) FROM "Horoscope" WHERE "isPublished" = true)::text AS published,
      (SELECT COUNT(*) FROM "Horoscope" WHERE "isPublished" = false)::text AS draft,
      (SELECT COUNT(*) FROM "User")::text AS users
  `);
  const row = r.rows[0];
  return {
    totalHoroscopes: parseInt(row?.total ?? "0", 10),
    publishedHoroscopes: parseInt(row?.published ?? "0", 10),
    draftHoroscopes: parseInt(row?.draft ?? "0", 10),
    totalUsers: parseInt(row?.users ?? "0", 10),
  };
}
