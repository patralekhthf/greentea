// /feeds/products.csv: product feed for Meta Commerce Manager (WhatsApp and
// Instagram catalogs). Also accepted by Google Merchant Center. Built from the
// DB, so admin price, photo and stock changes flow through on the next fetch.

import { db } from "@/lib/db";
import { TEA_LINE_LIVE, dishTypeLabel } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { buildImageUrl } from "@/lib/cloudinary-url";

export const revalidate = 3600;

// Meta wants JPG/PNG, at least 500x500; pad onto white so packs aren't cropped.
const FEED_IMAGE = "w_1024,h_1024,c_pad,b_white,f_jpg,q_auto";

const COLUMNS = [
  "id", "title", "description", "availability", "condition", "price", "sale_price",
  "link", "image_link", "additional_image_link", "brand", "product_type",
  "google_product_category",
] as const;

function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function inr(amount: { toString(): string }): string {
  return `${Number(amount.toString()).toFixed(2)} INR`;
}

export async function GET() {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED", ...(TEA_LINE_LIVE ? {} : { productLine: "PREMIX" }) },
    include: {
      countryConfigs: { where: { country: { code: "IN" } } },
      images: { orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }] },
    },
    orderBy: { name: "asc" },
  });

  const rows = products.flatMap((p) => {
    const cfg = p.countryConfigs[0];
    // Items without an India price or a photo would be rejected by Meta.
    if (!cfg?.isAvailable || !p.images.length) return [];
    const inStock = cfg.status !== "OUT_OF_STOCK";
    const onSale = cfg.salePrice && Number(cfg.salePrice) < Number(cfg.price);
    const record: Record<(typeof COLUMNS)[number], string> = {
      id: p.sku ?? p.slug,
      title: p.name,
      description: p.shortDescription,
      availability: inStock ? "in stock" : "out of stock",
      condition: "new",
      price: inr(cfg.price),
      sale_price: onSale ? inr(cfg.salePrice!) : "",
      link: `${SITE_URL}/products/${p.slug}`,
      image_link: buildImageUrl(p.images[0].cloudinaryPublicId, FEED_IMAGE),
      additional_image_link: p.images.slice(1, 10).map((i) => buildImageUrl(i.cloudinaryPublicId, FEED_IMAGE)).join(","),
      brand: "Kanta Greens",
      product_type: `Masala Premixes > ${dishTypeLabel(p.dishType) ?? "Premixes"}`,
      google_product_category: "Food, Beverages & Tobacco > Food Items > Seasonings & Spices > Herbs & Spices",
    };
    return [COLUMNS.map((c) => csvCell(record[c])).join(",")];
  });

  const body = [COLUMNS.join(","), ...rows].join("\n") + "\n";
  return new Response(body, {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
