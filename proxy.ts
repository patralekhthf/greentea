// Next.js proxy (formerly middleware) — runs on every request at the edge
// Responsibilities:
//   1. Resolve country from cookie → ipapi.co → browser locale → default (IN)
//   2. Protect /admin/* routes — redirect to /admin/login if no valid session
//   3. Write gt_country cookie for SSR pages to read

import { NextRequest, NextResponse } from "next/server";

const COUNTRY_COOKIE = "gt_country";
const ADMIN_SESSION_COOKIE = "gt_admin_session";
const SUPPORTED = ["IN", "US", "GB", "AU"];
const DEFAULT = "IN";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin route protection ──────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = req.cookies.get(ADMIN_SESSION_COOKIE);
    if (!session?.value) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    // Full JWT verification happens in the API route handler
    return NextResponse.next();
  }

  // ── Country resolution (public routes) ──────────────────────────────────────
  const res = NextResponse.next();

  // 1. Check existing cookie (manual override or saved preference)
  const existing = req.cookies.get(COUNTRY_COOKIE)?.value;
  if (existing && SUPPORTED.includes(existing)) {
    return res; // Already set — nothing to do
  }

  // 2. Detect from IP via ipapi.co
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    ""; // Empty in local dev — falls back to default

  let country = DEFAULT;

  if (ip && ip !== "::1" && ip !== "127.0.0.1") {
    try {
      const r = await fetch(`https://ipapi.co/${ip}/country/`, {
        signal: AbortSignal.timeout(1500),
      });
      if (r.ok) {
        const code = (await r.text()).trim().toUpperCase();
        if (SUPPORTED.includes(code)) country = code;
      }
    } catch {
      // ipapi.co unavailable — use default
    }
  }

  // 3. Write cookie so SSR pages read it without a fresh IP lookup
  res.cookies.set(COUNTRY_COOKIE, country, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: false,            // Needs to be readable by client JS for the switcher
    sameSite: "lax",
    path: "/",
  });

  return res;
}

export const config = {
  matcher: [
    // Run on all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
