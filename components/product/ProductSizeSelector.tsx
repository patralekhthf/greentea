"use client";

import { useState } from "react";

type Props = {
  sizes: string[];
  price: number;
  salePrice: number | null;
  currencySymbol: string;
};

export default function ProductSizeSelector({
  sizes,
  price,
  salePrice,
  currencySymbol,
}: Props) {
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? null);

  const discountPct =
    salePrice !== null
      ? Math.round(((price - salePrice) / price) * 100)
      : null;

  return (
    <div className="mb-6">
      {/* Price row */}
      <div className="flex items-baseline gap-3 mb-3">
        {salePrice !== null ? (
          <>
            <span className="text-3xl font-bold text-brand-green">
              {currencySymbol}{salePrice.toFixed(0)}
            </span>
            <span className="text-xl text-brand-muted line-through">
              {currencySymbol}{price.toFixed(0)}
            </span>
            <span className="text-sm font-semibold text-red-600">
              {discountPct}% off
            </span>
          </>
        ) : (
          <span className="text-3xl font-bold text-brand-green">
            {currencySymbol}{price.toFixed(0)}
          </span>
        )}
        {selectedSize && (
          <span className="text-sm text-brand-muted">/ {selectedSize}</span>
        )}
      </div>

      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
            Pack Size
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = size === selectedSize;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                    isSelected
                      ? "bg-brand-green text-white border-brand-green"
                      : "bg-white text-brand-dark border-brand-border hover:border-brand-sage hover:text-brand-green"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
          {sizes.length > 1 && (
            <p className="text-xs text-brand-muted mt-2">
              Price shown for {selectedSize}. Other sizes may vary.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
