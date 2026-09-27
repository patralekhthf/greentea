/**
 * Import the premix catalogue (scripts/data/premixes.ts) into the database.
 *
 *   npm run db:import-premixes -- --dry-run        validate the data, no DB access
 *   npm run db:import-premixes -- --yes            upsert as DRAFT (existing status kept)
 *   npm run db:import-premixes -- --yes --publish  upsert and set status PUBLISHED
 *   add --skip-images to leave product photos untouched
 *
 * - Matches products by slug, so it is safe to re-run after editing the data file.
 * - Writes the India price (ProductCountryConfig for IN). The migration
 *   20260927100000_premix_product_line must already be applied.
 * - Photos listed in the data file (scripts/data/images) are uploaded to Cloudinary
 *   as gt/products/premix/<file name>, overwriting on re-runs, and attached with
 *   the first one as the primary image. Needs the CLOUDINARY_* env vars.
 * - Uses DATABASE_URL from .env.local. Check the host it prints before passing --yes.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { COOK_WITH, DISH_TYPES } from "../lib/catalog";
import { PREMIXES, STORAGE, type PremixSeed } from "./data/premixes";

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const CONFIRMED = args.has("--yes");
const PUBLISH = args.has("--publish");
const SKIP_IMAGES = args.has("--skip-images");
const IMAGE_DIR = path.join(__dirname, "data", "images");
const CLOUDINARY_FOLDER = "gt/products/premix";

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
    for (const file of p.images) {
      if (!existsSync(path.join(IMAGE_DIR, file))) errors.push(`${at} image not found: ${file}`);
    }
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
      method: p.cookingInstructions.includes("coming soon") ? "pending" : "yes",
      photos: p.images.length || "pending",
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

  // Cloudinary SDK configured directly: lib/cloudinary.ts is "server-only" (Next.js only)
  const { v2: cloudinary } = await import("cloudinary");
  if (!SKIP_IMAGES) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

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

    let photos = 0;
    if (!SKIP_IMAGES && p.images.length > 0) {
      for (const [i, file] of p.images.entries()) {
        const publicId = `${CLOUDINARY_FOLDER}/${path.parse(file).name}`;
        const uploaded = await cloudinary.uploader.upload(path.join(IMAGE_DIR, file), {
          public_id: publicId,
          overwrite: true,
          invalidate: true,
          resource_type: "image",
        });
        const existing = await db.productImage.findFirst({
          where: { productId: product.id, cloudinaryPublicId: uploaded.public_id },
          select: { id: true },
        });
        if (i === 0) {
          // Our first photo becomes the primary (card) image
          await db.productImage.updateMany({ where: { productId: product.id }, data: { isPrimary: false } });
        }
        const data = { altText: p.name, displayOrder: i, isPrimary: i === 0, imageType: "PRODUCT" as const };
        if (existing) {
          await db.productImage.update({ where: { id: existing.id }, data });
        } else {
          await db.productImage.create({ data: { productId: product.id, cloudinaryPublicId: uploaded.public_id, ...data } });
        }
        photos++;
      }
    }

    console.log(`✔ ${p.sku.padEnd(15)} ${p.name} (${product.status}, ${photos} photo${photos === 1 ? "" : "s"})`);
  }

  await db.$disconnect();
  console.log("\nDone. Products without photos show a placeholder until you upload one in Admin > Products.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
