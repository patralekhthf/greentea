import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { where: { isPrimary: true }, take: 1, select: { cloudinaryPublicId: true } },
      countryConfigs: {
        where: { country: { code: "IN" } },
        select: { price: true, salePrice: true, status: true },
      },
    },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const product = await db.product.create({ data: body });
  return NextResponse.json(product, { status: 201 });
}
