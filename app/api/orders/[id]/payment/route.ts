import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/orders/:id/payment — customer submits the UPI UTR for their order.
 * Body: { utr: string, mobile: string }. The mobile must match the order.
 * Payment stays PENDING until an admin verifies it in the bank / UPI app.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const utr = typeof body.utr === "string" ? body.utr.replace(/\s+/g, "") : "";
  const mobile = typeof body.mobile === "string" ? body.mobile.replace(/\D/g, "").slice(-10) : "";

  if (!/^[A-Za-z0-9]{8,22}$/.test(utr)) {
    return NextResponse.json({ error: "Please enter the UTR / transaction reference from your UPI app." }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { id },
    select: { id: true, customerMobile: true, paymentStatus: true, orderStatus: true },
  });
  if (!order || order.customerMobile !== mobile) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.paymentStatus === "SUCCESS" || order.orderStatus === "CANCELLED") {
    return NextResponse.json({ error: "This order can no longer be paid." }, { status: 409 });
  }

  await db.order.update({
    where: { id },
    data: { paymentReference: utr, paymentSubmittedAt: new Date(), paymentGateway: "upi" },
  });
  return NextResponse.json({ ok: true });
}
