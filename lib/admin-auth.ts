import "server-only";
import { createHmac } from "crypto";

const SECRET = () => {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error("ADMIN_JWT_SECRET is not set");
  return s;
};

function b64url(str: string): string {
  return Buffer.from(str).toString("base64url");
}

const HEADER = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));

/** Sign a JWT-compatible HS256 token with the admin email as subject */
export function signAdminToken(email: string): string {
  const payload = b64url(
    JSON.stringify({ sub: email, iat: Math.floor(Date.now() / 1000) })
  );
  const sig = createHmac("sha256", SECRET())
    .update(`${HEADER}.${payload}`)
    .digest("base64url");
  return `${HEADER}.${payload}.${sig}`;
}

/** Verify token — returns email on success, null on failure */
export function verifyAdminToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, sig] = parts;
    const expected = createHmac("sha256", SECRET())
      .update(`${header}.${payload}`)
      .digest("base64url");
    if (sig !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof data.sub === "string" ? data.sub : null;
  } catch {
    return null;
  }
}

export const ADMIN_SESSION_COOKIE = "gt_admin_session";
