import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestMeta } from "@/lib/request-meta";

type CartItem = {
  productId: string;
  sku:       string;
  name:      string;
  size:      string;
  quantity:  number;
  price:     number;
  imageUrl:  string | null;
};

function computeTotals(items: CartItem[]) {
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal  = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return { itemCount, subtotal };
}

/**
 * POST /api/farmers-market/cart
 * Body: { items: CartItem[] }
 * Creates a cart row, returns { cartId }.
 */
export async function POST(req: NextRequest) {
  let body: { items?: CartItem[] };
  try { body = await req.json(); } catch { body = {}; }
  const items = Array.isArray(body.items) ? body.items : [];
  const { itemCount, subtotal } = computeTotals(items);
  const meta = getRequestMeta(req);

  const cart = await db.farmersMarketCart.create({
    data: {
      items: items as unknown as object,
      itemCount,
      subtotal,
      ...meta,
    },
    select: { id: true },
  });

  return NextResponse.json({ cartId: cart.id });
}
