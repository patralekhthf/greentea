import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: productId } = await params;
  const body = await req.json();

  const config = await db.productCountryConfig.upsert({
    where: { productId_countryId: { productId, countryId: body.countryId } },
    update: {
      price:                 body.price,
      salePrice:             body.salePrice,
      amazonEnabled:         body.amazonEnabled,
      amazonUrl:             body.amazonUrl,
      directPurchaseEnabled: body.directPurchaseEnabled,
      displayRating:         body.displayRating,
      displayReviewCount:    body.displayReviewCount,
      isAvailable:           body.isAvailable ?? true,
    },
    create: {
      productId,
      countryId:             body.countryId,
      price:                 body.price,
      salePrice:             body.salePrice,
      amazonEnabled:         body.amazonEnabled,
      amazonUrl:             body.amazonUrl,
      directPurchaseEnabled: body.directPurchaseEnabled,
      displayRating:         body.displayRating,
      displayReviewCount:    body.displayReviewCount,
      isAvailable:           body.isAvailable ?? true,
    },
  });
  return NextResponse.json(config);
}
