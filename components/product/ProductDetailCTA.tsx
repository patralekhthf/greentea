"use client";

type Props = {
  country: string;
  outOfStock: boolean;
  amazonEnabled: boolean;
  amazonUrl: string | null;
  productSlug: string;
};

export default function ProductDetailCTA({
  country,
  outOfStock,
  amazonEnabled,
  amazonUrl,
  productSlug: _productSlug,
}: Props) {
  const isIndia = country === "IN";

  if (isIndia) {
    return (
      <div className="flex flex-col gap-3">
        <button
          disabled={outOfStock}
          className="w-full py-3.5 rounded-full bg-brand-green text-white font-semibold text-sm hover:bg-brand-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title={outOfStock ? "Out of stock" : "Add to cart — coming soon"}
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
        {outOfStock && (
          <button className="w-full py-3 rounded-full border border-brand-green text-brand-green font-semibold text-sm hover:bg-brand-mint transition-colors">
            Notify Me When Available
          </button>
        )}
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
      Not available in your region yet
    </p>
  );
}
