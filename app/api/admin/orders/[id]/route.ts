import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}

type Action =
  | { action: "verify-payment" }
  | { action: "reject-payment" }
  | { action: "mark-shipped"; courierName: string; trackingNumber: string; trackingUrl?: string }
  | { action: "mark-delivered" }
  | { action: "cancel" };

/** PUT /api/admin/orders/:id — move a website order through its lifecycle. */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Action;
  const order = await db.order.findUnique({ where: { id }, select: { id: true, orderStatus: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const now = new Date();

  switch (body.action) {
    case "verify-payment":
      await db.order.update({
        where: { id },
        data: { paymentStatus: "SUCCESS", paymentVerifiedAt: now, ...(order.orderStatus === "PLACED" ? { orderStatus: "CONFIRMED" } : {}) },
      });
      break;
    case "reject-payment":
      // UTR didn't match: clear it so the customer can pay again from the Track Order page
      await db.order.update({
        where: { id },
        data: { paymentStatus: "PENDING", paymentReference: null, paymentSubmittedAt: null, paymentVerifiedAt: null },
      });
      break;
    case "mark-shipped": {
      const courierName = body.courierName?.trim();
      const trackingNumber = body.trackingNumber?.trim();
      if (!courierName || !trackingNumber) {
        return NextResponse.json({ error: "Courier and tracking number are required" }, { status: 400 });
      }
      const trackingUrl = body.trackingUrl?.trim() || null;
      await db.$transaction([
        db.shipmentTracking.upsert({
          where: { orderId: id },
          create: { orderId: id, courierName, trackingNumber, trackingUrl, shippedAt: now },
          update: { courierName, trackingNumber, trackingUrl, shippedAt: now },
        }),
        db.order.update({ where: { id }, data: { orderStatus: "SHIPPED" } }),
      ]);
      break;
    }
    case "mark-delivered":
      await db.$transaction([
        db.shipmentTracking.updateMany({ where: { orderId: id }, data: { deliveredAt: now } }),
        db.order.update({ where: { id }, data: { orderStatus: "DELIVERED" } }),
      ]);
      break;
    case "cancel":
      await db.order.update({ where: { id }, data: { orderStatus: "CANCELLED" } });
      break;
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const updated = await db.order.findUnique({ where: { id }, include: { items: true, address: true, tracking: true } });
  return NextResponse.json(updated);
}
