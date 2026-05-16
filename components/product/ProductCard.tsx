import Link from "next/link";
import Image from "next/image";
import type { ProductForCard } from "@/lib/products";
import { buildImageUrl, TRANSFORMS } from "@/lib/cloudinary-url";

type Props = {
  product: ProductForCard;
  country: string;
  currencySymbol: string;
};

const CAFFEINE_LABEL: Record<string, string> = {
  NONE: "Caffeine-free",
  LOW: "Low caffeine",
  MEDIUM: "Medium caffeine",
  HIGH: "Caffeinated",
};

export default function ProductCard({ product, country, currencySymbol }: Props) {
  const config = product.countryConfig;
  const isIndia = country === "IN";
  const outOfStock = config?.status === "OUT_OF_STOCK";

  const imageUrl = product.primaryImage
    ? buildImageUrl(product.primaryImage, TRANSFORMS.productCard)
    : null;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-brand-border bg-white overflow-hidden hover:shadow-lg hover:border-brand-sage transition-all duration-300">

      {/* Image area */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square bg-brand-mint overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-60">🍵</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isBestseller && (
              <span className="text-xs font-semibold bg-brand-green text-white px-2.5 py-1 rounded-full">
                Bestseller
              </span>
            )}
            {product.isFeatured && !product.isBestseller && (
              <span className="text-xs font-semibold bg-brand-gold text-white px-2.5 py-1 rounded-full">
                Featured
              </span>
            )}
            {outOfStock && (
              <span className="text-xs font-semibold bg-gray-500 text-white px-2.5 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Caffeine tag */}
          {product.caffeineLevel === "NONE" && (
            <span className="absolute bottom-3 right-3 text-xs bg-white/90 text-brand-green font-medium px-2 py-0.5 rounded-full border border-brand-border">
              Caffeine-free
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category tags */}
        {product.categoryNames.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.categoryNames.slice(0, 2).map((cat) => (
              <span key={cat} className="text-xs text-brand-muted">
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3
            className="font-bold text-brand-green text-sm leading-snug mb-1 group-hover:text-brand-mid transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Tagline */}
        {product.tagline && (
          <p className="text-xs text-brand-muted mb-3 leading-snug line-clamp-2">
            {product.tagline}
          </p>
        )}

        <div className="mt-auto">
          {/* Rating */}
          {config?.displayRating && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex text-brand-gold text-xs">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s}>
                    {s <= Math.round(parseFloat(config.displayRating!)) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <span className="text-xs font-semibold text-brand-dark">
                {config.displayRating}
              </span>
              {config.displayReviewCount && (
                <span className="text-xs text-brand-muted">
                  ({config.displayReviewCount.toLocaleString()})
                </span>
              )}
            </div>
          )}

          {/* Price */}
          {config?.price && (
            <div className="flex items-baseline gap-2 mb-3">
              {config.salePrice ? (
                <>
                  <span className="text-base font-bold text-brand-green">
                    {currencySymbol}{parseFloat(config.salePrice).toFixed(0)}
                  </span>
                  <span className="text-sm text-brand-muted line-through">
                    {currencySymbol}{parseFloat(config.price).toFixed(0)}
                  </span>
                </>
              ) : (
                <span className="text-base font-bold text-brand-green">
                  {currencySymbol}{parseFloat(config.price).toFixed(0)}
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          {isIndia ? (
            <button
              disabled={outOfStock}
              className="w-full text-xs font-semibold py-2.5 rounded-full border border-brand-green text-brand-green hover:bg-brand-green hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={outOfStock ? "Out of stock" : "Add to cart — coming soon"}
            >
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          ) : config?.amazonEnabled && config.amazonUrl ? (
            <a
              href={config.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-xs font-semibold py-2.5 rounded-full bg-brand-gold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              <span>Buy on Amazon</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className="w-full text-xs font-semibold py-2.5 rounded-full border border-brand-border text-brand-muted hover:border-brand-green hover:text-brand-green transition-colors flex items-center justify-center"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
