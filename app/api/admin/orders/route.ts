import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}

/** GET /api/admin/orders?view=to-verify|to-ship|shipped|all&q= — website orders */
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const view = url.searchParams.get("view") ?? "all";
  const q = url.searchParams.get("q")?.trim();

  const where = {
    ...(view === "to-verify" ? { paymentStatus: "PENDING" as const, paymentReference: { not: null }, orderStatus: { not: "CANCELLED" as const } } : {}),
    ...(view === "unpaid"    ? { paymentStatus: "PENDING" as const, paymentReference: null, orderStatus: { not: "CANCELLED" as const } } : {}),
    ...(view === "to-ship"   ? { orderStatus: "CONFIRMED" as const } : {}),
    ...(view === "shipped"   ? { orderStatus: "SHIPPED" as const } : {}),
    ...(q ? { OR: [
      { orderNumber:    { contains: q, mode: "insensitive" as const } },
      { customerName:   { contains: q, mode: "insensitive" as const } },
      { customerMobile: { contains: q } },
      { paymentReference: { contains: q } },
    ] } : {}),
  };

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { items: true, address: true, tracking: true },
  });
  return NextResponse.json(orders);
}
