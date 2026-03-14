const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  process.env.DATABASE_PUBLIC_URL ||
  process.env.POSTGRES_URL ||
  "";

export const env = {
  databaseUrl,
  adminJwtSecret: (process.env.ADMIN_JWT_SECRET ?? "changeme").trim(),
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  clerkJwtIssuer: (process.env.CLERK_JWT_ISSUER ?? "").replace(/\/$/, ""),
  clerkJwtAudience: process.env.CLERK_JWT_AUDIENCE ?? "",
};
