import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/farmers-market/orders/:id/payment
 * Body: { upiUtr: string, upiVpa: string }
 * Records that the customer has submitted a UTR — sets status PAID + paidAt.
 * The admin still needs to manually verify the transaction in their UPI app.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const utr = typeof body.upiUtr === "string" ? body.upiUtr.trim() : "";
  const vpa = typeof body.upiVpa === "string" ? body.upiVpa.trim() : null;

  if (!/^[A-Za-z0-9]{8,22}$/.test(utr)) {
    return NextResponse.json({ error: "Invalid UTR" }, { status: 400 });
  }

  try {
    const now = new Date();
    const updated = await db.farmersMarketOrder.update({
      where: { id },
      data: {
        upiUtr:             utr,
        upiVpa:             vpa,
        paymentSubmittedAt: now,
        paidAt:             now,
        status:             "PAID", // customer claims paid; admin verifies via toggle
      },
      select: { id: true, orderNumber: true, upiUtr: true, status: true },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
