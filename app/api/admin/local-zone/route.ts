import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}

const DEFAULT_ID = "default";

/** GET — fetch the single local delivery zone config (or null). */
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const zone = await db.localDeliveryZone.findUnique({ where: { id: DEFAULT_ID } });
  return NextResponse.json(zone);
}

/** PUT — upsert the local delivery zone config. */
export async function PUT(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Validate numeric inputs
  const centerLat = parseFloat(body.centerLat);
  const centerLng = parseFloat(body.centerLng);
  const radiusKm  = parseFloat(body.radiusKm);
  if (Number.isNaN(centerLat) || centerLat < -90 || centerLat > 90) {
    return NextResponse.json({ error: "Invalid centerLat" }, { status: 400 });
  }
  if (Number.isNaN(centerLng) || centerLng < -180 || centerLng > 180) {
    return NextResponse.json({ error: "Invalid centerLng" }, { status: 400 });
  }
  if (Number.isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 500) {
    return NextResponse.json({ error: "Invalid radiusKm (must be 0–500)" }, { status: 400 });
  }
  if (typeof body.addressLabel !== "string" || body.addressLabel.trim() === "") {
    return NextResponse.json({ error: "addressLabel required" }, { status: 400 });
  }
  if (typeof body.whatsappNumber !== "string" || body.whatsappNumber.trim() === "") {
    return NextResponse.json({ error: "whatsappNumber required" }, { status: 400 });
  }

  // Strip non-digits from whatsappNumber so wa.me deep-links always work
  const whatsappNumber = body.whatsappNumber.replace(/[^0-9]/g, "");

  // UPI fields — empty string means "clear it"
  const upiVpa          = typeof body.upiVpa          === "string" ? body.upiVpa.trim()          : null;
  const upiPayeeName    = typeof body.upiPayeeName    === "string" ? body.upiPayeeName.trim()    : null;
  const upiInstructions = typeof body.upiInstructions === "string" ? body.upiInstructions.trim() : null;

  // Light VPA validation: must contain @ and at least one char on each side
  if (upiVpa && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(upiVpa)) {
    return NextResponse.json({ error: "Invalid UPI VPA — expected format: name@bank" }, { status: 400 });
  }

  const data = {
    isActive:       Boolean(body.isActive),
    addressLabel:   body.addressLabel.trim(),
    centerLat,
    centerLng,
    radiusKm,
    whatsappNumber,
    upiVpa:          upiVpa          || null,
    upiPayeeName:    upiPayeeName    || null,
    upiInstructions: upiInstructions || null,
    bannerText:     body.bannerText    ?? undefined,
    freshnessNote:  body.freshnessNote ?? undefined,
    paymentNote:    body.paymentNote   ?? undefined,
  };

  const zone = await db.localDeliveryZone.upsert({
    where:  { id: DEFAULT_ID },
    update: data,
    create: { id: DEFAULT_ID, ...data },
  });

  return NextResponse.json(zone);
}
