import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type CartItem = {
  productId: string;
  sku: string; name: string; size: string;
  quantity: number; price: number;
  imageUrl: string | null;
};

function computeTotals(items: CartItem[]) {
  return {
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal:  items.reduce((s, i) => s + i.price * i.quantity, 0),
  };
}

/**
 * PUT /api/farmers-market/cart/:id
 * Body: { items: CartItem[] }
 * Replaces the cart's items. Updates lastSeenAt.
 */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: { items?: CartItem[] };
  try { body = await req.json(); } catch { body = {}; }
  const items = Array.isArray(body.items) ? body.items : [];
  const { itemCount, subtotal } = computeTotals(items);

  try {
    await db.farmersMarketCart.update({
      where: { id },
      data: {
        items: items as unknown as object,
        itemCount,
        subtotal,
        lastSeenAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    // cart was deleted or id was invalid — caller will create a new one on next add
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
}
