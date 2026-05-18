import { NextResponse, type NextRequest } from "next/server";

const SUPPORTED = new Set(["IN", "US", "GB", "AU"]);
const COOKIE_NAME = "gt_country";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Sets the gt_country cookie based on the visitor's IP on first visit.
 * Uses Vercel's x-vercel-ip-country header (set automatically by the edge).
 * If the country isn't one we sell in, defaults to "IN".
 *
 * Once the cookie exists (set here or by LocationSwitcher), this is a no-op.
 */
export function middleware(req: NextRequest) {
  // Already set — let it ride
  if (req.cookies.get(COOKIE_NAME)?.value) {
    return NextResponse.next();
  }

  const ipCountry = req.headers.get("x-vercel-ip-country")?.toUpperCase();
  const country   = ipCountry && SUPPORTED.has(ipCountry) ? ipCountry : "IN";

  const res = NextResponse.next();
  res.cookies.set(COOKIE_NAME, country, {
    path:     "/",
    maxAge:   COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  return res;
}

// Run on every page request — skip API and static assets
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)",
  ],
};
