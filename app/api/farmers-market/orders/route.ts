import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestMeta } from "@/lib/request-meta";

type CartItem = {
  productId: string;
  sku: string; name: string; size: string;
  quantity: number; price: number;
  imageUrl: string | null;
};

type Body = {
  cartId?:         string | null;
  items:           CartItem[];
  customerName?:   string;
  customerMobile:  string;
  paymentMethod:   string;
};

/** Generate a friendly order number like FM-20260517-0042 */
async function nextOrderNumber(): Promise<string> {
  const now    = new Date();
  const ymd    = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const prefix = `FM-${ymd}-`;
  // Count today's orders
  const start  = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end    = new Date(start.getTime() + 86_400_000);
  const todayCount = await db.farmersMarketOrder.count({
    where: { createdAt: { gte: start, lt: end } },
  });
  return `${prefix}${String(todayCount + 1).padStart(4, "0")}`;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = (await req.json()) as Body; } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Basic validation
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  if (!body.customerMobile || !/^[6-9]\d{9}$/.test(body.customerMobile.replace(/\D/g, "").slice(-10))) {
    return NextResponse.json({ error: "Valid 10-digit Indian mobile required" }, { status: 400 });
  }
  if (!body.paymentMethod) {
    return NextResponse.json({ error: "Payment method required" }, { status: 400 });
  }

  const itemCount = body.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal  = body.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const meta      = getRequestMeta(req);
  const mobile    = body.customerMobile.replace(/\D/g, "").slice(-10);

  // Verify the cartId points to an actual row before linking. A stale ID in
  // localStorage (e.g. cart was wiped from the DB) used to break the FK and
  // make the whole POST fail — instead, just drop the link and continue.
  let validCartId: string | null = null;
  if (body.cartId) {
    try {
      const cart = await db.farmersMarketCart.findUnique({
        where:  { id: body.cartId },
        select: { id: true },
      });
      if (cart) validCartId = cart.id;
    } catch { /* fall through with null */ }
  }

  try {
    const orderNumber = await nextOrderNumber();

    const order = await db.farmersMarketOrder.create({
      data: {
        orderNumber,
        // Prisma 7 requires the relation-field syntax when a relation is defined
        ...(validCartId ? { cart: { connect: { id: validCartId } } } : {}),
        customerName:   body.customerName?.trim() || null,
        customerMobile: mobile,
        paymentMethod:  body.paymentMethod,
        items:          body.items as unknown as object,
        itemCount,
        subtotal,
        whatsappSentAt: new Date(),
        ...meta,
      },
      select: { id: true, orderNumber: true },
    });

    if (validCartId) {
      await db.farmersMarketCart.update({
        where: { id: validCartId },
        data: {
          status:         "CONVERTED",
          customerName:   body.customerName?.trim() || null,
          customerMobile: mobile,
          paymentMethod:  body.paymentMethod,
        },
      }).catch(() => { /* race condition — cart was just deleted, ignore */ });
    }

    return NextResponse.json({
      orderId:     order.id,
      orderNumber: order.orderNumber,
      // Signal to the client whether the stale cartId should be cleared
      cartIdInvalid: body.cartId != null && validCartId === null,
    });
  } catch (err) {
    // Log full stack server-side, surface a useful hint to the client
    console.error("[fm/orders POST]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Could not save order: ${message}` },
      { status: 500 }
    );
  }
}
