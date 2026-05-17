import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { distanceKm, geocodePincode } from "@/lib/distance";

/**
 * GET /api/local/check
 * Returns { active: boolean } so the banner can decide whether to show at all.
 * Doesn't expose lat/lng — just the boolean and customer-facing copy.
 */
export async function GET() {
  const zone = await db.localDeliveryZone.findUnique({ where: { id: "default" } });
  if (!zone || !zone.isActive) return NextResponse.json({ active: false });
  return NextResponse.json({
    active: true,
    zone: {
      addressLabel:  zone.addressLabel,
      radiusKm:      zone.radiusKm,
      bannerText:    zone.bannerText,
    },
  });
}

/**
 * POST /api/local/check
 * Body — one of:
 *   { lat: number, lng: number }
 *   { pincode: string }
 * Returns: { inZone: boolean, distanceKm?: number, zone?: {...} }
 */
export async function POST(req: NextRequest) {
  const zone = await db.localDeliveryZone.findUnique({ where: { id: "default" } });
  if (!zone || !zone.isActive) {
    return NextResponse.json({ inZone: false, active: false });
  }

  const body = await req.json().catch(() => ({}));

  let lat: number | undefined;
  let lng: number | undefined;
  let resolvedFrom: "geo" | "pincode" | null = null;
  let pincodeLabel: string | undefined;

  if (typeof body.lat === "number" && typeof body.lng === "number") {
    lat = body.lat;
    lng = body.lng;
    resolvedFrom = "geo";
  } else if (typeof body.pincode === "string") {
    const geo = await geocodePincode(body.pincode);
    if (!geo) {
      return NextResponse.json(
        { error: "Could not look up that pincode — please try a different one or use location." },
        { status: 400 }
      );
    }
    lat = geo.lat;
    lng = geo.lng;
    pincodeLabel = geo.label;
    resolvedFrom = "pincode";
  } else {
    return NextResponse.json(
      { error: "Provide either { lat, lng } or { pincode }" },
      { status: 400 }
    );
  }

  if (lat === undefined || lng === undefined) {
    return NextResponse.json({ error: "Could not resolve coordinates" }, { status: 400 });
  }

  const d = distanceKm(lat, lng, zone.centerLat, zone.centerLng);
  const inZone = d <= zone.radiusKm;

  return NextResponse.json({
    active:       true,
    inZone,
    distanceKm:   Math.round(d * 10) / 10,
    resolvedFrom,
    pincodeLabel,
    resolvedLat:  lat,
    resolvedLng:  lng,
    zone: {
      addressLabel:   zone.addressLabel,
      radiusKm:       zone.radiusKm,
      whatsappNumber: zone.whatsappNumber,
      bannerText:     zone.bannerText,
      freshnessNote:  zone.freshnessNote,
      paymentNote:    zone.paymentNote,
    },
  });
}
