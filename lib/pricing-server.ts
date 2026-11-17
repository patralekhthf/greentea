import "server-only";
import { db } from "@/lib/db";
import { computePrices, liveFromPrices, normaliseConfig, type PricingConfig } from "@/lib/pricing";

export type StockState = "ACTIVE" | "OUT_OF_STOCK";

export type PricingRow = {
  productId: string;
  sku: string | null;
  name: string;
  pack: string;
  published: boolean;
  makingCost: number | null;
  live: { price: number | null; salePrice: number | null; stock: StockState };
};

export type PricingData = { config: PricingConfig; rows: PricingRow[]; configUpdatedAt: string | null };

const num = (v: { toString(): string } | null | undefined) => (v == null ? null : Number(v.toString()));

/** Everything the Pricing page and the Excel download need. Premixes only (teas are on hold). */
export async function loadPricing(): Promise<PricingData> {
  const [cfg, products] = await Promise.all([
    db.pricingConfig.findUnique({ where: { id: "default" } }),
    db.product.findMany({
      where: { productLine: "PREMIX" },
      orderBy: { name: "asc" },
      select: {
        id: true, sku: true, name: true, packagingSizes: true, status: true,
        pricing: { select: { makingCost: true } },
        countryConfigs: { where: { country: { code: "IN" } }, select: { price: true, salePrice: true, status: true } },
      },
    }),
  ]);
  return {
    config: normaliseConfig(cfg?.values),
    configUpdatedAt: cfg?.updatedAt.toISOString() ?? null,
    rows: products.map((p) => {
      const ic = p.countryConfigs[0];
      return {
        productId: p.id,
        sku: p.sku,
        name: p.name,
        pack: p.packagingSizes[0] ?? "",
        published: p.status === "PUBLISHED",
        makingCost: num(p.pricing?.makingCost),
        live: {
          price: num(ic?.price),
          salePrice: num(ic?.salePrice),
          stock: ic?.status === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "ACTIVE",
        },
      };
    }),
  };
}

/** Save the config, making costs and stock. Prices on the store only change via publishPrices. */
export async function savePricing(input: {
  config: PricingConfig;
  rows: { productId: string; makingCost: number | null; stock?: StockState }[];
}) {
  const config = normaliseConfig(input.config);
  const india = await db.country.findUniqueOrThrow({ where: { code: "IN" } });
  await db.$transaction([
    db.pricingConfig.upsert({ where: { id: "default" }, create: { id: "default", values: config }, update: { values: config } }),
    ...input.rows.map((r) =>
      db.productPricing.upsert({
        where: { productId: r.productId },
        create: { product: { connect: { id: r.productId } }, makingCost: r.makingCost },
        update: { makingCost: r.makingCost },
      }),
    ),
    ...input.rows
      .filter((r) => r.stock)
      .map((r) =>
        db.productCountryConfig.updateMany({
          where: { productId: r.productId, countryId: india.id },
          data: { status: r.stock },
        }),
      ),
  ]);
}

export type PublishChange = {
  productId: string;
  name: string;
  from: { price: number | null; salePrice: number | null };
  to: { price: number; salePrice: number | null };
};

/** Website prices that Publish would write, recomputed from what is saved (never from the browser). */
export async function pendingPublish(): Promise<PublishChange[]> {
  const { config, rows } = await loadPricing();
  const changes: PublishChange[] = [];
  for (const r of rows) {
    const prices = computePrices(r.makingCost, config);
    if (!prices) continue;
    const to = liveFromPrices(prices);
    if (to.price !== r.live.price || to.salePrice !== r.live.salePrice) {
      changes.push({ productId: r.productId, name: r.name, from: { price: r.live.price, salePrice: r.live.salePrice }, to });
    }
  }
  return changes;
}

/** Write MRP (list price) and website price (charged) to the India store config. */
export async function publishPrices(): Promise<PublishChange[]> {
  const changes = await pendingPublish();
  if (changes.length === 0) return changes;
  const india = await db.country.findUniqueOrThrow({ where: { code: "IN" } });
  await db.$transaction(
    changes.map((c) =>
      db.productCountryConfig.upsert({
        where: { productId_countryId: { productId: c.productId, countryId: india.id } },
        create: { productId: c.productId, countryId: india.id, price: c.to.price, salePrice: c.to.salePrice, isAvailable: true, directPurchaseEnabled: true },
        update: { price: c.to.price, salePrice: c.to.salePrice },
      }),
    ),
  );
  return changes;
}
