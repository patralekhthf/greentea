"use client";

import { useState } from "react";
import ShopFilters from "@/components/product/ShopFilters";
import ShopSortBar from "@/components/product/ShopSortBar";
import ProductCard from "@/components/product/ProductCard";
import type { ProductForCard } from "@/lib/products";

type Props = {
  products: ProductForCard[];
  country: string;
  currencySymbol: string;
};

export default function ShopClient({ products, country, currencySymbol }: Props) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="flex gap-10">

      {/* Desktop filter sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <ShopFilters />
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-brand-dark">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-brand-muted hover:text-brand-dark"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ShopFilters isMobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <ShopSortBar
          total={products.length}
          onMobileFiltersOpen={() => setMobileFiltersOpen(true)}
        />

        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                country={country}
                currencySymbol={currencySymbol}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-6xl mb-6 block">🍵</span>
      <h3
        className="text-xl font-bold text-brand-green mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        No teas found
      </h3>
      <p className="text-brand-muted text-sm max-w-xs">
        Try adjusting your filters or search term. Our collection is growing — check back soon.
      </p>
    </div>
  );
}
