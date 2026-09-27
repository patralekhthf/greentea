import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { priceCart, nextOrderNumber, CartError, type CartLineInput } from "@/lib/site-orders";
import { EMAIL_RE, INDIAN_STATES, MOBILE_RE, PINCODE_RE } from "@/lib/india";

type Body = {
  items: CartLineInput[];
  customer: { name: string; mobile: string; email: string };
  address: { line1: string; line2?: string; city: string; state: string; pincode: string };
};

const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * POST /api/orders — place a website (all-India) order.
 * Prices and delivery are recomputed on the server. The order starts as
 * PLACED / payment PENDING; the customer then submits their UPI UTR
 * (POST /api/orders/:id/payment) and an admin verifies it.
 */
export async function POST(req: NextRequest) {
  let body: Body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name    = clean(body.customer?.name, 100);
  const mobile  = clean(body.customer?.mobile, 20).replace(/\D/g, "").slice(-10);
  const email   = clean(body.customer?.email, 254).toLowerCase();
  const line1   = clean(body.address?.line1);
  const line2   = clean(body.address?.line2);
  const city    = clean(body.address?.city, 100);
  const state   = clean(body.address?.state, 100);
  const pincode = clean(body.address?.pincode, 6);

  const problems: string[] = [];
  if (name.length < 2) problems.push("full name");
  if (!MOBILE_RE.test(mobile)) problems.push("a valid 10-digit mobile number");
  if (!EMAIL_RE.test(email)) problems.push("a valid email");
  if (line1.length < 5) problems.push("house / street address");
  if (city.length < 2) problems.push("city");
  if (!(INDIAN_STATES as readonly string[]).includes(state)) problems.push("state");
  if (!PINCODE_RE.test(pincode)) problems.push("a valid 6-digit pincode");
  if (problems.length) {
    return NextResponse.json({ error: `Please enter ${problems.join(", ")}.` }, { status: 400 });
  }

  let priced;
  try {
    priced = await priceCart(body.items);
  } catch (err) {
    if (err instanceof CartError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }

  const india = await db.country.findUnique({ where: { code: "IN" }, select: { id: true } });
  if (!india) return NextResponse.json({ error: "Store is not configured" }, { status: 500 });

  // Order numbers are per-day counters; retry if two orders race for the same number.
  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNumber = await nextOrderNumber();
    try {
      const order = await db.order.create({
        data: {
          orderNumber,
          customerName: name,
          customerEmail: email,
          customerMobile: mobile,
          countryId: india.id,
          subtotal: priced.subtotal,
          shippingAmount: priced.shipping,
          totalAmount: priced.total,
          paymentGateway: "upi",
          items: {
            create: priced.lines.map((l) => ({
              productId: l.productId,
              productNameSnapshot: l.name,
              skuSnapshot: l.sku,
              sizeSnapshot: l.size,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              totalPrice: l.lineTotal,
            })),
          },
          address: {
            create: { fullName: name, addressLine1: line1, addressLine2: line2 || null, city, state, pincode },
          },
        },
        select: { id: true, orderNumber: true },
      });
      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        subtotal: priced.subtotal,
        shipping: priced.shipping,
        total: priced.total,
      });
    } catch (err) {
      const dup = err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!dup || attempt === 2) {
        console.error("[orders POST]", err);
        return NextResponse.json({ error: "Could not place your order. Please try again." }, { status: 500 });
      }
    }
  }
  return NextResponse.json({ error: "Could not place your order. Please try again." }, { status: 500 });
}
