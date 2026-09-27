import "server-only";
import { db } from "./db";
import { shippingFor } from "./shipping";
import { MAX_QTY } from "./site-cart-limits";

export type CartLineInput = { productId: string; size: string; quantity: number };

export type PricedLine = {
  productId: string;
  name: string;
  sku: string | null;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type PricedCart = {
  lines: PricedLine[];
  units: number;
  subtotal: number;
  shipping: number;
  total: number;
};

export class CartError extends Error {}

/**
 * Re-prices a cart from the database. Only published premixes with an India
 * price can be bought; the browser's prices are never trusted.
 */
export async function priceCart(items: CartLineInput[]): Promise<PricedCart> {
  if (!Array.isArray(items) || items.length === 0) throw new CartError("Your cart is empty.");
  if (items.length > 50) throw new CartError("Too many items in one order.");

  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await db.product.findMany({
    where: { id: { in: ids }, productLine: "PREMIX", status: "PUBLISHED" },
    include: {
      countryConfigs: { where: { country: { code: "IN" }, isAvailable: true } },
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: PricedLine[] = [];
  const unavailable: string[] = [];
  for (const item of items) {
    const p = byId.get(item.productId);
    const cfg = p?.countryConfigs[0];
    if (!p || !cfg || cfg.status === "OUT_OF_STOCK") {
      unavailable.push(p?.name ?? "An item");
      continue;
    }
    const qty = Math.floor(Number(item.quantity));
    if (!(qty >= 1 && qty <= MAX_QTY)) throw new CartError(`Quantity for ${p.name} must be between 1 and ${MAX_QTY}.`);
    const size = String(item.size ?? "");
    if (p.packagingSizes.length > 0 && !p.packagingSizes.includes(size)) {
      throw new CartError(`${p.name} isn't available in ${size || "that size"}. Please re-add it to your cart.`);
    }
    const unitPrice = Number(cfg.salePrice ?? cfg.price);
    lines.push({ productId: p.id, name: p.name, sku: p.sku, size, quantity: qty, unitPrice, lineTotal: unitPrice * qty });
  }
  if (unavailable.length) {
    throw new CartError(`No longer available: ${[...new Set(unavailable)].join(", ")}. Please remove it from your cart.`);
  }

  const units = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const shipping = shippingFor(units);
  return { lines, units, subtotal, shipping, total: subtotal + shipping };
}

/** KG-YYYYMMDD-NNNN, numbered per India calendar day. */
export async function nextOrderNumber(): Promise<string> {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()).replace(/-/g, "");
  const prefix = `KG-${ymd}-`;
  const today = await db.order.count({ where: { orderNumber: { startsWith: prefix } } });
  return `${prefix}${String(today + 1).padStart(4, "0")}`;
}
