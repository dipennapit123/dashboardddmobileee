import { query } from "./db";
import type { ZodiacSign } from "./types";

export async function getLatestHoroscopeForZodiac(zodiac: ZodiacSign) {
  const r = await query(
    `SELECT * FROM "Horoscope"
     WHERE "zodiacSign" = $1 AND "isPublished" = true
     ORDER BY date DESC LIMIT 1`,
    [zodiac],
  );
  return r.rows[0] ?? null;
}

export async function getHoroscopeHistoryForZodiac(
  zodiac: ZodiacSign,
  limit = 30,
) {
  const published = await query(
    `SELECT * FROM "Horoscope"
     WHERE "zodiacSign" = $1 AND "isPublished" = true
     ORDER BY date DESC LIMIT $2`,
    [zodiac, limit],
  );
  return published.rows;
}
