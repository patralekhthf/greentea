/**
 * Import the premix catalogue (scripts/data/premixes.ts) into the database.
 *
 *   npm run db:import-premixes -- --dry-run        validate the data, no DB access
 *   npm run db:import-premixes -- --yes            upsert as DRAFT (existing status kept)
 *   npm run db:import-premixes -- --yes --publish  upsert and set status PUBLISHED
 *
 * - Matches products by slug, so it is safe to re-run after editing the data file.
 * - Writes the India price (ProductCountryConfig for IN). The migration
 *   20260927100000_premix_product_line must already be applied.
 * - Images are not touched; upload them in Admin > Products.
 * - Uses DATABASE_URL from .env.local. Check the host it prints before passing --yes.
 */

import { COOK_WITH, DISH_TYPES } from "../lib/catalog";
import { PREMIXES, STORAGE, type PremixSeed } from "./data/premixes";

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const CONFIRMED = args.has("--yes");
const PUBLISH = args.has("--publish");

function validate(items: PremixSeed[]): string[] {
  const errors: string[] = [];
  const dishSlugs = new Set<string>(DISH_TYPES.map((d) => d.slug));
  const cookSlugs = new Set<string>(COOK_WITH.map((c) => c.slug));
  const seenSlug = new Set<string>();
  const seenSku = new Set<string>();

  for (const p of items) {
    const at = `[${p.slug}]`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) errors.push(`${at} slug must be lowercase-hyphenated`);
    if (seenSlug.has(p.slug)) errors.push(`${at} duplicate slug`);
    if (seenSku.has(p.sku)) errors.push(`${at} duplicate SKU ${p.sku}`);
    seenSlug.add(p.slug);
    seenSku.add(p.sku);
    if (!/^[A-Z0-9-]+$/.test(p.sku)) errors.push(`${at} SKU must be A-Z, 0-9 and hyphens`);
    if (!dishSlugs.has(p.dishType)) errors.push(`${at} unknown dishType "${p.dishType}"`);
    for (const c of p.pairsWith) if (!cookSlugs.has(c)) errors.push(`${at} unknown pairsWith "${c}"`);
    if (!(p.priceINR > 0)) errors.push(`${at} price must be positive`);
    for (const field of ["name", "shortDescription", "longDescription", "ingredients"] as const) {
      if (!p[field].trim()) errors.push(`${at} ${field} is empty`);
    }
  }
  return errors;
}

async function main() {
  const errors = validate(PREMIXES);
  console.log(`Premix catalogue: ${PREMIXES.length} products`);
  console.table(
    PREMIXES.map((p) => ({
      sku: p.sku,
      name: p.name,
      dish: p.dishType,
      size: p.netWeight,
      price: `₹${p.priceINR}`,
      spice: p.spiceLevel ?? "—",
      nog: p.noOnionGarlic ? "yes" : "",
      method: p.cookingInstructions ? "yes" : "pending",
    }))
  );
  if (errors.length) {
    console.error(`\n${errors.length} problem(s):\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  console.log("Data is valid.");
  if (DRY_RUN) return;

  const host = (process.env.DATABASE_URL ?? "").match(/@([^/:?]+)/)?.[1] ?? "(unset)";
  console.log(`\nTarget database host: ${host}`);
  console.log(`Mode: ${PUBLISH ? "upsert + PUBLISH" : "upsert (new products as DRAFT)"}`);
  if (!CONFIRMED) {
    console.log("Nothing written. Re-run with --yes to import into this database.");
    return;
  }

  // Import lazily so --dry-run never opens a DB connection
  const { db } = await import("../lib/db");
  const india = await db.country.findUnique({ where: { code: "IN" } });
  if (!india) throw new Error("Country IN not found. Run the base seed first.");

  for (const p of PREMIXES) {
    const fields = {
      productLine: "PREMIX" as const,
      sku: p.sku,
      name: p.name,
      tagline: p.tagline,
      shortDescription: p.shortDescription,
      longDescription: p.longDescription,
      benefits: p.highlights,
      ingredients: p.ingredients,
      cookingInstructions: p.cookingInstructions,
      dishType: p.dishType,
      pairsWith: p.pairsWith,
      spiceLevel: p.spiceLevel,
      noOnionGarlic: p.noOnionGarlic,
      isVeg: true,
      packagingSizes: [p.netWeight],
      servings: p.servings,
      yieldNote: p.yieldNote,
      cookTimeMinutes: p.cookTimeMinutes,
      shelfLifeMonths: p.shelfLifeMonths,
      storageInstructions: STORAGE,
      allergens: p.allergens,
      isBestseller: p.isBestseller ?? false,
      isFeatured: p.isFeatured ?? false,
    };

    const product = await db.product.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...fields, status: PUBLISH ? "PUBLISHED" : "DRAFT" },
      update: { ...fields, ...(PUBLISH ? { status: "PUBLISHED" as const } : {}) },
      select: { id: true, status: true },
    });

    await db.productCountryConfig.upsert({
      where: { productId_countryId: { productId: product.id, countryId: india.id } },
      create: {
        productId: product.id,
        countryId: india.id,
        price: p.priceINR,
        isAvailable: true,
        directPurchaseEnabled: true,
      },
      update: { price: p.priceINR, isAvailable: true, directPurchaseEnabled: true },
    });

    console.log(`✔ ${p.sku.padEnd(15)} ${p.name} (${product.status})`);
  }

  await db.$disconnect();
  console.log("\nDone. Upload product photos in Admin > Products.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
