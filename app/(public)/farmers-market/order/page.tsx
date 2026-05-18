import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import OrderReviewClient from "./OrderReviewClient";

export const metadata: Metadata = {
  title: "WhatsApp Cart — Farmers Market",
  description: "Review your cart, pick a payment method, and send your order to the seller on WhatsApp.",
};

export const dynamic = "force-dynamic";

export default async function OrderReviewPage() {
  const zone = await db.localDeliveryZone.findUnique({ where: { id: "default" } });
  if (!zone || !zone.isActive) notFound();

  return (
    <OrderReviewClient
      whatsappNumber={zone.whatsappNumber}
      addressLabel={zone.addressLabel}
      radiusKm={zone.radiusKm}
    />
  );
}
