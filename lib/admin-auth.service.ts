import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { query } from "./db";
import type { AdminRow } from "./types";
import { env } from "./env";
import { ApiError } from "./api-error";

export async function setupFirstAdmin(
  email: string,
  password: string,
  name: string
) {
  if (!env.adminJwtSecret || env.adminJwtSecret === "changeme") {
    throw new ApiError(
      500,
      "Server misconfiguration: ADMIN_JWT_SECRET is not set."
    );
  }
  let count: number;
  try {
    const r = await query<{ count: string }>(
      'SELECT COUNT(*)::text as count FROM "Admin"'
    );
    count = parseInt(r.rows[0]?.count ?? "0", 10);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("connect") || msg.includes("Connection")) {
      throw new ApiError(503, "Database unavailable. Check DATABASE_URL.");
    }
    throw err;
  }
  if (count > 0) {
    throw new ApiError(403, "Admin already exists. Use the login page.");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const id = randomUUID();
  await query(
    `INSERT INTO "Admin" (id, name, email, "passwordHash", role)
     VALUES ($1, $2, $3, $4, 'SUPER_ADMIN')`,
    [id, name || "Admin", email, passwordHash]
  );
  const token = jwt.sign(
    { adminId: id, role: "SUPER_ADMIN" },
    env.adminJwtSecret,
    { expiresIn: "7d" }
  );
  return {
    token,
    admin: { id, name: name || "Admin", email, role: "SUPER_ADMIN" as const },
  };
}

export async function loginAdmin(email: string, password: string) {
  if (!env.adminJwtSecret || env.adminJwtSecret === "changeme") {
    throw new ApiError(
      500,
      "Server misconfiguration: ADMIN_JWT_SECRET is not set."
    );
  }
  let rows: AdminRow[];
  try {
    const r = await query<AdminRow>(
      `SELECT id, name, email, "passwordHash", role, "createdAt", "updatedAt"
       FROM "Admin" WHERE email = $1`,
      [email]
    );
    rows = r.rows;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("connect") || msg.includes("Connection")) {
      throw new ApiError(503, "Database unavailable. Check DATABASE_URL.");
    }
    throw err;
  }
  const admin = rows[0];
  if (!admin) throw new ApiError(401, "Invalid credentials.");
  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) throw new ApiError(401, "Invalid credentials.");
  const token = jwt.sign(
    { adminId: admin.id, role: admin.role },
    env.adminJwtSecret,
    { expiresIn: "7d" }
  );
  return {
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  };
}
