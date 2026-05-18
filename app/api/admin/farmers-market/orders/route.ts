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
  const q      = url.searchParams.get("q")?.trim();

  const orders = await db.farmersMarketOrder.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q ? {
        OR: [
          { orderNumber:    { contains: q, mode: "insensitive" } },
          { customerName:   { contains: q, mode: "insensitive" } },
          { customerMobile: { contains: q } },
        ],
      } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(orders);
}
