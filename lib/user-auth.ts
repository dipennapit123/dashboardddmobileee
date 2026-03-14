import jwt from "jsonwebtoken";
import JwksClient from "jwks-rsa";
import { headers } from "next/headers";
import { env } from "./env";
import { ApiError } from "./api-error";

/**
 * Verifies Clerk JWT (Bearer token) via JWKS and returns the Clerk user id (sub).
 * Used by mobile app and any client using Clerk auth.
 */
export async function getUserIdFromRequest(): Promise<string> {
  const h = await headers();
  const authHeader = h.get("authorization");
  const headerUserId = h.get("x-clerk-user-id");

  if (authHeader?.startsWith("Bearer ") && env.clerkJwtIssuer) {
    const token = authHeader.slice("Bearer ".length);
    const jwks = JwksClient({
      jwksUri: `${env.clerkJwtIssuer}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
    });
    const decoded = jwt.decode(token, { complete: true }) as
      | { header: { kid?: string }; payload: { sub?: string } }
      | null;
    if (!decoded?.header?.kid || !decoded?.payload?.sub) {
      throw new ApiError(401, "Invalid token.");
    }
    const key = await jwks.getSigningKey(decoded.header.kid);
    const publicKey = key.getPublicKey();
    jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      issuer: env.clerkJwtIssuer,
      ...(env.clerkJwtAudience ? { audience: env.clerkJwtAudience } : {}),
    });
    return decoded.payload.sub;
  }

  if (headerUserId) {
    return headerUserId;
  }

  throw new ApiError(401, "Missing authenticated user.");
}
