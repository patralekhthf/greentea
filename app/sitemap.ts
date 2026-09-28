import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { TEA_LINE_LIVE } from "@/lib/catalog";
import { SITE_URL, STATIC_PAGES } from "@/lib/site";

// Rebuilt at most hourly so new products and posts show up without a deploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    db.product.findMany({
      where: { status: "PUBLISHED", ...(TEA_LINE_LIVE ? {} : { productLine: "PREMIX" }) },
      select: { slug: true, updatedAt: true },
    }),
    db.blog.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    ...STATIC_PAGES.map((p) => ({
      url: `${SITE_URL}${p.path === "/" ? "" : p.path}`,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
