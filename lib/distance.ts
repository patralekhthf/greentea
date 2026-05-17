// Haversine distance + Indian pincode lookup utilities for the
// Farmers Market local delivery feature.

/**
 * Distance in kilometres between two lat/lng pairs using the Haversine formula.
 * Accurate to within a few metres at small distances — perfect for "within 5 km" checks.
 */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Look up lat/lng for an Indian 6-digit pincode using postalpincode.in (free, no key).
 * Returns null if pincode is invalid, not found, or the API is unreachable.
 *
 * Note: postalpincode.in returns post-office info but no coordinates. We use
 * Nominatim (OpenStreetMap) for geocoding — also free.
 */
export async function geocodePincode(
  pincode: string
): Promise<{ lat: number; lng: number; label: string } | null> {
  // Validate input
  const cleaned = pincode.trim();
  if (!/^[1-9][0-9]{5}$/.test(cleaned)) return null;

  try {
    // Use Nominatim (OSM) — free, no API key. We restrict to India.
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${cleaned}&country=India&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        // Nominatim requires a User-Agent
        "User-Agent": "KantaGreens/1.0 (admin@kantagreens.com)",
      },
      next: { revalidate: 86400 }, // Cache 24h — pincodes don't move
    });
    if (!res.ok) return null;
    const arr = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const first = arr[0];
    return {
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
      label: first.display_name,
    };
  } catch {
    return null;
  }
}
