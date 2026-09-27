// Next.js proxy (formerly middleware) — runs on every request at the edge
// Responsibilities:
//   1. Protect /admin/* routes — redirect to /admin/login if no valid session
//   2. Pin the gt_country cookie to IN (India-only launch)

import { NextRequest, NextResponse } from "next/server";

const COUNTRY_COOKIE = "gt_country";
const ADMIN_SESSION_COOKIE = "gt_admin_session";
const DEFAULT = "IN";

export function proxy(req: NextRequest) {
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

  // ── Country (public routes) ─────────────────────────────────────────────────
  // Phase 1 sells in India only, so every visitor is pinned to IN. This also
  // resets anyone who still has a US/GB/AU cookie from the old tea site.
  // To go international again, restore IP detection (see git history).
  const res = NextResponse.next();
  if (req.cookies.get(COUNTRY_COOKIE)?.value !== DEFAULT) {
    res.cookies.set(COUNTRY_COOKIE, DEFAULT, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,            // Read by client JS (location switcher)
      sameSite: "lax",
      path: "/",
    });
  }

  return res;
}

export const config = {
  matcher: [
    // Run on all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
