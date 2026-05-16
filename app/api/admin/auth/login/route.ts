import { NextRequest, NextResponse } from "next/server";
import { signAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const validEmail    = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    return NextResponse.json({ error: "Admin credentials not configured" }, { status: 500 });
  }

  if (email !== validEmail || password !== validPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signAdminToken(email);
  const res   = NextResponse.json({ ok: true });

  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 7, // 7 days
    path:     "/",
  });

  return res;
}
