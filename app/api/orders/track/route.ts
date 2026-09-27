import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/orders/track?orderNumber=KG-...&mobile=98xxxxxxxx
 * Returns a customer-safe view of the order. Both values must match.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orderNumber = (url.searchParams.get("orderNumber") ?? "").trim().toUpperCase();
  const mobile = (url.searchParams.get("mobile") ?? "").replace(/\D/g, "").slice(-10);

  if (!orderNumber || mobile.length !== 10) {
    return NextResponse.json({ error: "Enter your order number and the 10-digit mobile used at checkout." }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true, address: true, tracking: true },
  });
  if (!order || order.customerMobile !== mobile) {
    return NextResponse.json({ error: "We couldn't find an order with those details." }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.id, // lets the owner of this mobile pay a pending order
    orderNumber: order.orderNumber,
    placedAt: order.createdAt,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentSubmitted: Boolean(order.paymentReference),
    subtotal: Number(order.subtotal),
    shipping: Number(order.shippingAmount),
    total: Number(order.totalAmount),
    items: order.items.map((i) => ({
      name: i.productNameSnapshot,
      size: i.sizeSnapshot,
      quantity: i.quantity,
      total: Number(i.totalPrice),
    })),
    shipTo: order.address ? `${order.address.city}, ${order.address.state} ${order.address.pincode}` : null,
    tracking: order.tracking
      ? {
          courier: order.tracking.courierName,
          trackingNumber: order.tracking.trackingNumber,
          trackingUrl: order.tracking.trackingUrl,
          shippedAt: order.tracking.shippedAt,
          deliveredAt: order.tracking.deliveredAt,
        }
      : null,
  });
}
