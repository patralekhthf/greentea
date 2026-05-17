import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}

/**
 * GET — list all hero banners (one per country) joined with country code.
 * Returns: [{ id, countryCode, imageUrl, isActive }, …]
 */
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const banners = await db.banner.findMany({
    where: { position: "hero" },
    include: { country: { select: { code: true } } },
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json(
    banners.map((b) => ({
      id:          b.id,
      countryCode: b.country?.code ?? null,
      imageUrl:    b.imageUrl,
      isActive:    b.isActive,
      title:       b.title,
    }))
  );
}

/**
 * PUT — upsert hero banner for a country.
 * Body: { countryCode: "IN" | "US" | "GB" | "AU", imageUrl: string (Cloudinary publicId) }
 */
export async function PUT(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { countryCode, imageUrl } = await req.json();
  if (!countryCode || !imageUrl) {
    return NextResponse.json({ error: "countryCode and imageUrl required" }, { status: 400 });
  }

  const country = await db.country.findUnique({ where: { code: countryCode } });
  if (!country) {
    return NextResponse.json({ error: "Invalid country code" }, { status: 400 });
  }

  // Find any existing hero banner for this country
  const existing = await db.banner.findFirst({
    where: { position: "hero", countryId: country.id },
  });

  const banner = existing
    ? await db.banner.update({
        where: { id: existing.id },
        data:  { imageUrl, isActive: true },
      })
    : await db.banner.create({
        data: {
          title:    `Hero — ${countryCode}`,
          imageUrl,
          position: "hero",
          countryId: country.id,
          isActive: true,
        },
      });

  return NextResponse.json({
    id:          banner.id,
    countryCode,
    imageUrl:    banner.imageUrl,
    isActive:    banner.isActive,
  });
}

/**
 * DELETE — remove hero banner for a country.
 * Body: { countryCode: string }
 */
export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { countryCode } = await req.json();
  if (!countryCode) {
    return NextResponse.json({ error: "countryCode required" }, { status: 400 });
  }

  const country = await db.country.findUnique({ where: { code: countryCode } });
  if (!country) return NextResponse.json({ ok: true }); // nothing to delete

  await db.banner.deleteMany({
    where: { position: "hero", countryId: country.id },
  });

  return NextResponse.json({ ok: true });
}
