"use client";

import AddToCartButton from "./AddToCartButton";
import type { ModalProduct } from "@/components/local/QuickAddModal";
import { DELIVERY_PROMISE } from "@/lib/shipping";

type Props = {
  country: string;
  outOfStock: boolean;
  amazonEnabled: boolean;
  amazonUrl: string | null;
  /** Needed for the India cart; null when the product has no India price */
  cartProduct: (ModalProduct & { slug: string }) | null;
};

export default function ProductDetailCTA({
  country,
  outOfStock,
  amazonEnabled,
  amazonUrl,
  cartProduct,
}: Props) {
  const isIndia = country === "IN";

  if (isIndia && cartProduct) {
    return (
      <div className="flex flex-col gap-2">
        <AddToCartButton product={cartProduct} disabled={outOfStock} variant="full" />
        <p className="text-xs text-brand-muted text-center">🚚 {DELIVERY_PROMISE}</p>
      </div>
    );
  }

  if (amazonEnabled && amazonUrl) {
    return (
      <a
        href={amazonUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-brand-gold text-white font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        <span>Buy on Amazon</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    );
  }

  return (
    <p className="text-sm text-brand-muted text-center py-3 border border-brand-border rounded-full">
      Not available to order right now
    </p>
  );
}
