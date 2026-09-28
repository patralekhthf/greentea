// /llms.txt: a plain-markdown map of the site for AI assistants (llmstxt.org).
// Built from the DB, so new products and posts appear without a deploy.

import { db } from "@/lib/db";
import { BUSINESS } from "@/lib/business";
import { DELIVERY_PROMISE, SHIPPING } from "@/lib/shipping";
import { TEA_LINE_LIVE, dishTypeLabel } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export async function GET() {
  const [products, posts] = await Promise.all([
    db.product.findMany({
      where: { status: "PUBLISHED", ...(TEA_LINE_LIVE ? {} : { productLine: "PREMIX" }) },
      select: {
        name: true, slug: true, shortDescription: true, dishType: true,
        countryConfigs: {
          where: { country: { code: "IN" } },
          select: { price: true, salePrice: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    db.blog.findMany({
      where: { status: "PUBLISHED" },
      select: { title: true, slug: true, excerpt: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const productLines = products.map((p) => {
    const cfg = p.countryConfigs[0];
    const price = cfg?.salePrice ?? cfg?.price;
    const bits = [dishTypeLabel(p.dishType), price ? `₹${price.toString()}` : null].filter(Boolean).join(", ");
    return `- [${p.name}](${SITE_URL}/products/${p.slug})${bits ? ` (${bits})` : ""}: ${p.shortDescription}`;
  });

  const postLines = posts.map(
    (p) => `- [${p.title}](${SITE_URL}/blog/${p.slug})${p.excerpt ? `: ${p.excerpt}` : ""}`,
  );

  const body = `# ${BUSINESS.name}

> ${BUSINESS.name} (${BUSINESS.tagline}) makes ready-to-cook Indian masala premixes: sambhar, chhole, paneer tikka and other gravies, biryani, chutney and sweets. Add water and your main ingredient, heat, and the dish is ready in minutes. Sold online across India with UPI payment, and locally in New Delhi through our Farmers Market WhatsApp cart.

- Ships within India only. ${DELIVERY_PROMISE}
- Delivery: ₹${SHIPPING.firstUnit} for the first pack, ₹${SHIPPING.additionalUnit} for each additional pack.
- Payment: UPI (scan QR at checkout and enter the UTR).
- Customer care (call or WhatsApp): ${BUSINESS.customerCare}
- Address: ${BUSINESS.addressLines.join(", ")}
- Our herbal and green teas are coming soon and cannot be ordered yet.

## Premixes

${productLines.join("\n")}

## Recipes and blog

${postLines.join("\n")}

## Company and policies

- [About us](${SITE_URL}/about): who we are and how the premixes are made
- [Contact](${SITE_URL}/contact): phone, WhatsApp, address, bulk orders
- [Shipping policy](${SITE_URL}/legal/shipping)
- [Refund and cancellation policy](${SITE_URL}/legal/refund)
- [Terms and conditions](${SITE_URL}/legal/terms)
- [Privacy policy](${SITE_URL}/legal/privacy)

## Optional

- [Shop all premixes](${SITE_URL}/shop)
- [Farmers Market, New Delhi](${SITE_URL}/farmers-market): local delivery via WhatsApp
- [Teas (coming soon)](${SITE_URL}/teas)
- [Sitemap](${SITE_URL}/sitemap.xml)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
