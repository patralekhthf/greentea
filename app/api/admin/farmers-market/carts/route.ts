import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url    = new URL(req.url);
  const status = url.searchParams.get("status");

  const carts = await db.farmersMarketCart.findMany({
    where: status ? { status: status as never } : {},
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { order: { select: { orderNumber: true, id: true } } },
  });

  // Aggregate stats
  const [active, converted, abandoned] = await Promise.all([
    db.farmersMarketCart.count({ where: { status: "ACTIVE" } }),
    db.farmersMarketCart.count({ where: { status: "CONVERTED" } }),
    db.farmersMarketCart.count({ where: { status: "ABANDONED" } }),
  ]);

  return NextResponse.json({ carts, stats: { active, converted, abandoned } });
}
