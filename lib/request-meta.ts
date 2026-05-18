import "server-only";
import type { NextRequest } from "next/server";

/** Extracts IP / geolocation / device data from a request — works on Vercel + Netlify. */
export function getRequestMeta(req: NextRequest) {
  const headers = req.headers;
  const cookies = req.cookies;

  // IP — Vercel/Netlify both set x-forwarded-for; first hop is the client
  const xff = headers.get("x-forwarded-for");
  const ipAddress =
    xff?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    null;

  const userAgent = headers.get("user-agent") ?? null;
  const referrer  = headers.get("referer") ?? null;

  // Geolocation (Vercel sets these on each request automatically)
  let countryCode = headers.get("x-vercel-ip-country") ?? null;
  let city        = headers.get("x-vercel-ip-city")    ?? null;
  let latitude:  number | null = parseFloatOrNull(headers.get("x-vercel-ip-latitude"));
  let longitude: number | null = parseFloatOrNull(headers.get("x-vercel-ip-longitude"));

  // Decode URL-encoded city names
  if (city) {
    try { city = decodeURIComponent(city); } catch { /* keep as-is */ }
  }

  // Fall back to cookies set elsewhere on the site
  if (!countryCode) {
    countryCode = cookies.get("gt_country")?.value ?? null;
  }

  // The Farmers Market check banner stores its resolved lat/lng/pincode in a cookie
  const localCheck = cookies.get("gt_local_check")?.value;
  let pincode: string | null = null;
  if (localCheck) {
    try {
      const parsed = JSON.parse(decodeURIComponent(localCheck)) as {
        lat?: number; lng?: number; pincode?: string;
      };
      if (latitude === null && typeof parsed.lat === "number") latitude = parsed.lat;
      if (longitude === null && typeof parsed.lng === "number") longitude = parsed.lng;
      if (parsed.pincode) pincode = parsed.pincode;
    } catch { /* ignore bad cookie */ }
  }

  return { ipAddress, userAgent, referrer, countryCode, city, latitude, longitude, pincode };
}

function parseFloatOrNull(v: string | null): number | null {
  if (!v) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}
