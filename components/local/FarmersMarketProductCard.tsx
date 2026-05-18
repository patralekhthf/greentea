"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QuickAddModal, { type ModalProduct } from "./QuickAddModal";

type Props = {
  product: ModalProduct & {
    slug: string;
    salePrice: number | null;
  };
};

function formatINR(n: number) {
  return `₹${n.toFixed(0)}`;
}

export default function FarmersMarketProductCard({ product }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden hover:shadow-lg transition-all flex flex-col">
        {/* Image */}
        <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-brand-mint overflow-hidden group">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-60">🍵</div>
          )}
        </Link>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              className="font-bold text-brand-green text-base leading-snug"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.name}
            </h3>
            <span className="shrink-0 text-[10px] font-mono bg-brand-mint text-brand-green px-2 py-0.5 rounded-full">
              {product.sku}
            </span>
          </div>
          {product.tagline && (
            <p className="text-xs text-brand-muted mb-3">{product.tagline}</p>
          )}

          {/* Freshness note */}
          <div className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full mb-4 self-start bg-green-50 text-green-800 border border-green-100">
            📦 Packed fresh on order · 14 days freshness
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-lg font-bold text-brand-green">{formatINR(product.price)}</span>
            {product.salePrice && (
              <span className="text-sm text-brand-muted line-through">{formatINR(product.salePrice)}</span>
            )}
          </div>

          {/* CTAs */}
          <div className="mt-auto">
            <button
              onClick={() => setOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-semibold py-2.5 rounded-full hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z"/>
              </svg>
              Add to WhatsApp Cart
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="block text-center text-xs font-semibold text-brand-muted hover:text-brand-green mt-2 py-1"
            >
              See full details →
            </Link>
          </div>
        </div>
      </div>

      {open && <QuickAddModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
