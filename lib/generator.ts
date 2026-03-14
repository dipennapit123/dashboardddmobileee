import type { ZodiacSign } from "./types";
import { env } from "./env";

export type HoroscopeTone = "mystical" | "modern" | "friendly" | "premium";

export interface GenerateHoroscopeInput {
  zodiacSign: ZodiacSign;
  date: Date;
  tone: HoroscopeTone;
  notes?: string;
}

export interface GeneratedHoroscopeContent {
  title: string;
  summary: string;
  wealthText: string;
  loveText: string;
  healthText: string;
  weeklyOutlook?: string;
}

export interface HoroscopeGeneratorService {
  generate(input: GenerateHoroscopeInput): Promise<GeneratedHoroscopeContent>;
}

// Richer sign flavors (match backend) so each zodiac gets distinct, trait-based copy
const signFlavors: Record<string, string> = {
  ARIES: "bold, impulsive, pioneering fire-sign energy that prefers action over hesitation.",
  TAURUS: "steady, sensual, earth-bound energy that values comfort, stability, and tangible results.",
  GEMINI: "curious, quick-thinking, air-sign energy that loves conversation, ideas, and mental variety.",
  CANCER: "intuitive, protective, water-sign energy that prioritizes emotional safety and home.",
  LEO: "radiant, dramatic, heart-led fire-sign energy that wants to be seen and shine authentically.",
  VIRGO: "precise, service-oriented, earth-sign energy that refines details and optimizes routines.",
  LIBRA: "harmonizing, relationship-focused air-sign energy that seeks balance, beauty, and fairness.",
  SCORPIO: "intense, transformative water-sign energy that moves beneath the surface and craves depth.",
  SAGITTARIUS: "expansive, truth-seeking fire-sign energy that craves freedom, travel, and big perspectives.",
  CAPRICORN: "ambitious, disciplined earth-sign energy that patiently builds long-term structures.",
  AQUARIUS: "futuristic, unconventional air-sign energy that innovates and values community.",
  PISCES: "dreamy, empathetic water-sign energy that blurs boundaries between imagination and reality.",
};

const sampleTitles = [
  "Cosmic Alignment", "Stellar Shift", "Lunar Guidance", "Planetary Pulse",
  "Star Path", "Celestial Moment", "Transit Day",
];
const sampleSummaries = [
  "Today stretches like a quiet threshold: subtle choices around timing, pacing, and who you answer first ripple farther than you expect.",
  "The day asks you to zoom out; when you remember the longer story you're trying to live, the small frictions suddenly make more sense.",
  "You're standing at a fork between familiar comfort and aligned discomfort—choosing the latter plants the seeds for real momentum.",
];
const sampleWealth = [
  "Treat your finances like a project, not a problem. Spend twenty focused minutes reviewing recurring costs.",
  "A conversation about value—your rates, your role—can shift the way money flows toward you.",
];
const sampleLove = [
  "Slow down enough to really hear the people you care about.",
  "If tension has been building, name the feeling without blame.",
];
const sampleHealth = [
  "Your nervous system is the real MVP today—nourish it with rhythm.",
  "Notice where your body whispers before it has to shout.",
];

const pick = (arr: string[], seed: number) => arr[seed % arr.length];
const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

class MockGenerator implements HoroscopeGeneratorService {
  async generate(input: GenerateHoroscopeInput): Promise<GeneratedHoroscopeContent> {
    const dayKey =
      input.date.getUTCFullYear() * 10000 +
      (input.date.getUTCMonth() + 1) * 100 +
      input.date.getUTCDate();
    const seed = dayKey + hashString(input.zodiacSign) * 17;
    return {
      title: pick(sampleTitles, seed),
      summary: pick(sampleSummaries, seed),
      wealthText: pick(sampleWealth, seed),
      loveText: pick(sampleLove, seed * 7),
      healthText: pick(sampleHealth, seed * 11),
      weeklyOutlook: undefined,
    };
  }
}

// Deterministic per-(date+sign) sky snapshot — every value changes when EITHER the date or the zodiac changes
function getDailyAstroContext(date: Date, zodiac: string): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / 86400000);

  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];
  const zodiacNorm = zodiac.charAt(0).toUpperCase() + zodiac.slice(1).toLowerCase();
  const zodiacIdx = signs.indexOf(zodiacNorm);
  const zi = zodiacIdx >= 0 ? zodiacIdx : 0;

  // Seed that combines date AND zodiac so every (date, sign) pair is unique
  const dateSeed = year * 10000 + month * 100 + day;
  const signSalt = (zi + 1) * 7919; // large prime per sign
  const seed = dateSeed * 13 + signSalt;

  const planets = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  const aspects = [
    "conjunct", "sextile", "square", "trine", "opposite",
    "semi-sextile", "quincunx", "parallel",
  ];
  const moonPhases = [
    "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
    "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
  ];
  const themes = [
    "communication breakthroughs", "financial restructuring", "romantic clarity",
    "career momentum", "creative inspiration", "emotional processing",
    "boundary setting", "spiritual awakening", "health reset", "social expansion",
    "solitude and reflection", "leadership opportunities", "healing old wounds",
    "unexpected travel", "technology or innovation", "family dynamics shift",
    "artistic expression", "risk-taking energy", "patience and discipline",
    "releasing what no longer serves you", "building new foundations",
    "reconciliation", "deepening trust", "exploring unknown territory",
  ];
  const challenges = [
    "overthinking", "impatience", "scattered energy", "self-doubt",
    "avoidance", "stubbornness", "people-pleasing", "emotional volatility",
    "procrastination", "overcommitting", "miscommunication", "jealousy",
    "burnout", "indecisiveness", "control issues", "fear of vulnerability",
  ];
  const elements = ["fire", "earth", "air", "water"];
  const signElement = elements[zi % 4];
  const rulerPlanets: Record<string, string> = {
    Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
    Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Pluto",
    Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Uranus", Pisces: "Neptune",
  };
  const ruler = rulerPlanets[zodiacNorm] ?? "Sun";

  const h = (offset: number) => ((seed * 2654435761 + offset * 999983) >>> 0);

  // Moon phase is shared across signs (real astro), but moon's house/angle differs per sign
  const moonPhase = moonPhases[Math.floor(dayOfYear / 3.7) % moonPhases.length];
  const moonSign = signs[(h(1) + zi * 3) % 12];
  const moonHouse = (h(2) % 12) + 1;

  const sunDeg = Math.floor((dayOfYear / 365.25) * 360);
  const sunSign = signs[Math.floor(((dayOfYear + 9) % 365) / 30.4) % 12];

  const mercurySign = signs[h(7) % 12];
  const mercuryHouse = (h(8) % 12) + 1;
  const venusSign = signs[h(13) % 12];
  const venusHouse = (h(14) % 12) + 1;
  const marsSign = signs[h(19) % 12];
  const marsHouse = (h(20) % 12) + 1;
  const jupiterSign = signs[h(23) % 12];
  const saturnSign = signs[h(29) % 12];

  const risingSign = signs[h(37) % 12];
  const rulingHouse = (h(41) % 12) + 1;

  const a1p = planets[h(50) % planets.length];
  const a1t = aspects[h(51) % aspects.length];
  const a1tgt = planets[h(52) % planets.length];
  const a2p = planets[h(60) % planets.length];
  const a2t = aspects[h(61) % aspects.length];
  const a2tgt = planets[h(62) % planets.length];
  // Third aspect unique to each sign
  const a3p = planets[h(65) % planets.length];
  const a3t = aspects[h(66) % aspects.length];
  const a3tgt = planets[h(67) % planets.length];

  const theme1 = themes[h(70) % themes.length];
  const theme2 = themes[h(71) % themes.length];
  const challenge = challenges[h(80) % challenges.length];

  const luckyNumber = (h(90) % 99) + 1;
  const peakHour = (h(95) % 12) + 8;
  const colorPool = ["gold", "silver", "deep blue", "emerald green", "crimson", "violet", "ivory", "amber", "teal", "rose", "midnight blue", "burnt orange"];
  const luckyColor = colorPool[h(96) % colorPool.length];

  const isRetrograde = (planet: string, idx: number) => (h(100 + idx) % 10) < 2;
  const retrogrades = planets.filter(isRetrograde);

  const wealthFocus = ["investments", "salary negotiation", "side income", "debt reduction", "saving strategy", "new revenue streams", "contract review", "budget overhaul"][h(110) % 8];
  const loveFocus = ["deep conversation", "quality time", "physical affection", "shared adventure", "vulnerability", "forgiveness", "flirting energy", "emotional honesty"][h(111) % 8];
  const healthFocus = ["cardio energy", "restorative sleep", "hydration", "stretching and flexibility", "mental clarity", "digestive health", "stress release", "outdoor movement"][h(112) % 8];

  const dateStr = date.toISOString().slice(0, 10);

  return [
    `PERSONALIZED SKY for ${zodiac} (${signElement} sign, ruled by ${ruler}) on ${dateStr}:`,
    "",
    `Moon: ${moonPhase} in ${moonSign}, transiting your ${moonHouse}th house.`,
    `Sun at ${sunDeg}° in ${sunSign}. Your rising sign today: ${risingSign}.`,
    `Mercury in ${mercurySign} (${mercuryHouse}th house) — affects your communication and thinking.`,
    `Venus in ${venusSign} (${venusHouse}th house) — shapes love, beauty, and money.`,
    `Mars in ${marsSign} (${marsHouse}th house) — drives your energy, ambition, and physical vitality.`,
    `Jupiter in ${jupiterSign}, Saturn in ${saturnSign}.`,
    retrogrades.length > 0 ? `Retrogrades active: ${retrogrades.join(", ")}.` : "No major retrogrades today.",
    "",
    `ASPECTS affecting ${zodiac} today:`,
    `  • ${a1p} ${a1t} ${a1tgt}`,
    `  • ${a2p} ${a2t} ${a2tgt}`,
    `  • ${a3p} ${a3t} ${a3tgt}`,
    "",
    `${zodiac}'s activated house: ${rulingHouse}th house.`,
    `Today's themes for ${zodiac}: ${theme1} and ${theme2}.`,
    `Today's challenge for ${zodiac}: ${challenge}.`,
    "",
    `SPECIFIC FOCUS AREAS for ${zodiac}:`,
    `  • Wealth/Career focus: ${wealthFocus}`,
    `  • Love/Relationship focus: ${loveFocus}`,
    `  • Health/Vitality focus: ${healthFocus}`,
    "",
    `Lucky number: ${luckyNumber}. Lucky color: ${luckyColor}. Peak energy: ${peakHour}:00.`,
  ].join("\n");
}

function buildMessages(input: GenerateHoroscopeInput): { role: "system" | "user"; content: string }[] {
  const signFlavor =
    signFlavors[input.zodiacSign] ??
    "use the sign's classic strengths and challenges in a grounded way.";
  const dateStr = input.date.toISOString().slice(0, 10);
  const astroContext = getDailyAstroContext(input.date, input.zodiacSign);

  const system = {
    role: "system" as const,
    content: [
      "You are an expert astrology copywriter for AstraDaily, a premium mobile horoscope app.",
      "You write personalized daily horoscopes that feel genuinely different each day because you base them on the planetary positions and aspects provided below.",
      "Write in simple, warm, easy-to-read language—friendly advice, not abstract poetry.",
      "",
      "STRICT RULES:",
      "1. Your horoscope MUST reference the specific planets, aspects, moon phase, and themes given in TODAY'S SKY. Do not ignore them.",
      "2. WEALTH advice must connect to the planets affecting finances/career for this sign today (e.g. Jupiter, Saturn, 2nd/10th house).",
      "3. LOVE advice must connect to the planets affecting relationships today (e.g. Venus, Moon, 7th house).",
      "4. HEALTH advice must connect to the planets affecting vitality today (e.g. Mars, Moon phase, 6th house).",
      "5. The title must be a creative 2-4 word phrase that captures THIS day's unique energy—never generic.",
      "6. The summary must mention at least ONE specific planet or aspect from today's sky.",
      "7. weeklyOutlook should tie the day's themes to broader patterns for the week ahead.",
      "8. Each field: 2-3 sentences. Simple English. No filler.",
    ].join("\n"),
  };

  const user = {
    role: "user" as const,
    content: [
      astroContext,
      "",
      `Zodiac sign: ${input.zodiacSign} – ${signFlavor}`,
      `Tone: ${input.tone}.`,
      input.notes ? `Astrologer's notes: ${input.notes}` : "",
      "",
      "Using the planetary positions and aspects above, write a horoscope that could ONLY apply to this exact sign on this exact date.",
      "If you removed the sign name and date, a reader should still be able to tell it apart from yesterday's or another sign's horoscope because the planetary references and advice are different.",
      "",
      "Return ONLY a JSON object, no markdown, no explanation:",
      '{ "title": "...", "summary": "...", "wealthText": "...", "loveText": "...", "healthText": "...", "weeklyOutlook": "..." }',
    ]
      .filter(Boolean)
      .join("\n"),
  };

  return [system, user];
}

const MAX_RETRIES = 3;
const MAX_RETRY_WAIT_MS = 15000;
// llama-3.1-8b-instant has much higher rate limits on Groq free tier (131k tokens/min vs 6k for 70b)
const GROQ_MODEL = "llama-3.1-8b-instant";

async function groqGenerate(
  input: GenerateHoroscopeInput
): Promise<GeneratedHoroscopeContent> {
  const { default: axios } = await import("axios");
  const messages = buildMessages(input);

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await axios.post<{ choices?: Array<{ message?: { content?: string } }> }>(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: GROQ_MODEL,
          messages,
          temperature: 0.95,
          top_p: 0.9,
          max_tokens: 700,
        },
        {
          headers: { Authorization: `Bearer ${env.groqApiKey}` },
          timeout: 30000,
        }
      );

      const raw = res.data.choices?.[0]?.message?.content ?? "{}";
      let parsed: Record<string, string>;
      try {
        const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = {};
      }
      return {
        title: parsed.title ?? "Cosmic Alignment",
        summary: parsed.summary ?? "The stars highlight a moment to realign your everyday choices with your deeper intentions.",
        wealthText: parsed.wealthText ?? "Grounded choices around money create more stability than quick wins today.",
        loveText: parsed.loveText ?? "Honest, compassionate conversations open the door to deeper connection.",
        healthText: parsed.healthText ?? "Gentle movement and mindful pauses help you feel centered and restored.",
        weeklyOutlook: parsed.weeklyOutlook ?? "Across the week, subtle shifts accumulate into meaningful momentum.",
      };
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429 && attempt < MAX_RETRIES) {
        const waitMs = Math.min(3000 * Math.pow(2, attempt), MAX_RETRY_WAIT_MS);
        console.warn(`[groq] 429 rate limited, waiting ${waitMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export function getGenerator(): HoroscopeGeneratorService {
  if (env.groqApiKey) {
    return {
      async generate(input) {
        return groqGenerate(input);
      },
    };
  }
  return new MockGenerator();
}
