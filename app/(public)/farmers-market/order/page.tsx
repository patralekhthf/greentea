import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { buildImageUrl, TRANSFORMS } from "@/lib/cloudinary-url";
import OrderReviewClient from "./OrderReviewClient";

export const metadata: Metadata = {
  title: "Review Your Order — Farmers Market",
  description: "Review your order, choose quantity & payment method, then place via WhatsApp.",
};

export const dynamic = "force-dynamic";

export default async function OrderReviewPage() {
  const zone = await db.localDeliveryZone.findUnique({ where: { id: "default" } });
  if (!zone || !zone.isActive) notFound();

  const products = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      countryConfigs: { some: { country: { code: "IN" }, isAvailable: true } },
    },
    include: {
      images: { where: { isPrimary: true }, take: 1, select: { cloudinaryPublicId: true } },
      countryConfigs: { where: { country: { code: "IN" } } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize for client
  const items = products.map((p) => ({
    id: p.id,
    sku: p.sku ?? p.slug.toUpperCase().slice(0, 8),
    name: p.name,
    slug: p.slug,
    price: p.countryConfigs[0]?.price ? Number(p.countryConfigs[0].price) : 0,
    imageUrl: p.images[0]?.cloudinaryPublicId
      ? buildImageUrl(p.images[0].cloudinaryPublicId, TRANSFORMS.productCard)
      : null,
  }));

  return (
    <OrderReviewClient
      products={items}
      whatsappNumber={zone.whatsappNumber}
      addressLabel={zone.addressLabel}
      radiusKm={zone.radiusKm}
    />
  );
}
