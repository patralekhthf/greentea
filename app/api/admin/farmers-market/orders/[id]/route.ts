import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}

const STATUS_TIMESTAMPS: Record<string, string> = {
  PAID:      "paidAt",
  PACKED:    "packedAt",
  SHIPPED:   "shippedAt",
  DELIVERED: "deliveredAt",
  CANCELLED: "cancelledAt",
};

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const order = await db.farmersMarketOrder.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  if (typeof body.status === "string") {
    data.status = body.status;
    // Auto-stamp the matching timestamp on first transition
    const tsField = STATUS_TIMESTAMPS[body.status];
    if (tsField) data[tsField] = new Date();
  }
  if (typeof body.internalNotes === "string") data.internalNotes = body.internalNotes;
  if (typeof body.customerName === "string")  data.customerName  = body.customerName;
  if (typeof body.customerMobile === "string") data.customerMobile = body.customerMobile;

  const updated = await db.farmersMarketOrder.update({ where: { id }, data });
  return NextResponse.json(updated);
}
