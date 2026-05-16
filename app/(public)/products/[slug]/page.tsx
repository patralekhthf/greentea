import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { getProductBySlug, getProducts } from "@/lib/products";
import { COUNTRY_CONFIG, isValidCountry } from "@/lib/ipapi";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductDetailCTA from "@/components/product/ProductDetailCTA";
import ProductCard from "@/components/product/ProductCard";
import ProductContentTabs from "@/components/product/ProductContentTabs";
import ProductSizeSelector from "@/components/product/ProductSizeSelector";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
    },
  };
}

const CAFFEINE_LABELS: Record<string, { label: string; color: string }> = {
  NONE:   { label: "Caffeine-free",   color: "bg-brand-mint text-brand-green" },
  LOW:    { label: "Low caffeine",    color: "bg-yellow-50 text-yellow-700" },
  MEDIUM: { label: "Medium caffeine", color: "bg-orange-50 text-orange-700" },
  HIGH:   { label: "Caffeinated",     color: "bg-red-50 text-red-700" },
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const rawCountry = cookieStore.get("gt_country")?.value ?? "IN";
  const country = isValidCountry(rawCountry) ? rawCountry : "IN";
  const { currencySymbol } = COUNTRY_CONFIG[country];

  const product = await getProductBySlug(slug, country);
  if (!product) notFound();

  const config = product.countryConfigs[0] ?? null;
  const outOfStock = config?.status === "OUT_OF_STOCK";
  const price = config?.price ? parseFloat(config.price.toString()) : null;
  const salePrice = config?.salePrice ? parseFloat(config.salePrice.toString()) : null;
  const rating = config?.displayRating ? parseFloat(config.displayRating.toString()) : null;
  const reviewCount = config?.displayReviewCount ?? null;

  const teaTypeCategories = product.categories
    .filter((c) => c.category.categoryType === "TEA_TYPE")
    .map((c) => c.category);
  const wellnessCategories = product.categories
    .filter((c) => c.category.categoryType === "WELLNESS_GOAL")
    .map((c) => c.category);

  const caffeine = CAFFEINE_LABELS[product.caffeineLevel] ?? CAFFEINE_LABELS.NONE;

  // Related products — same tea type, exclude current
  const related = teaTypeCategories[0]
    ? (
        await getProducts({ country, category: teaTypeCategories[0].slug })
      ).filter((p) => p.slug !== product.slug).slice(0, 4)
    : [];

  return (
    <div className="min-h-screen bg-brand-cream">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-xs text-brand-muted">
            <Link href="/" className="hover:text-brand-green transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-brand-green transition-colors">Shop</Link>
            {teaTypeCategories[0] && (
              <>
                <span>/</span>
                <Link
                  href={`/shop?category=${teaTypeCategories[0].slug}`}
                  className="hover:text-brand-green transition-colors capitalize"
                >
                  {teaTypeCategories[0].name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-brand-dark font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main product section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">

          {/* Left: Image gallery */}
          <div className="lg:sticky lg:top-24 self-start">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Right: Product info */}
          <div className="flex flex-col">

            {/* Category + badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {teaTypeCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="text-xs font-medium text-brand-green bg-brand-mint px-3 py-1 rounded-full hover:bg-brand-sage/20 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              {product.isBestseller && (
                <span className="text-xs font-semibold bg-brand-green text-white px-3 py-1 rounded-full">
                  Bestseller
                </span>
              )}
              {product.isFeatured && !product.isBestseller && (
                <span className="text-xs font-semibold bg-brand-gold text-white px-3 py-1 rounded-full">
                  Featured
                </span>
              )}
            </div>

            {/* Name */}
            <h1
              className="text-3xl sm:text-4xl font-bold text-brand-green leading-tight mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.name}
            </h1>

            {/* Tagline */}
            {product.tagline && (
              <p className="text-base text-brand-muted italic mb-4">{product.tagline}</p>
            )}

            {/* Rating */}
            {rating !== null && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex text-brand-gold text-sm">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s}>{s <= Math.round(rating) ? "★" : "☆"}</span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-brand-dark">{rating.toFixed(1)}</span>
                {reviewCount && (
                  <span className="text-sm text-brand-muted">
                    ({reviewCount.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Price + size selector */}
            {price !== null && (
              <ProductSizeSelector
                sizes={product.packagingSizes}
                price={price}
                salePrice={salePrice}
                currencySymbol={currencySymbol}
              />
            )}

            {/* Short description */}
            <p className="text-brand-muted text-sm leading-relaxed mb-6">
              {product.shortDescription}
            </p>

            {/* Caffeine badge */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${caffeine.color}`}>
                {caffeine.label}
              </span>
            </div>

            {/* Wellness goals */}
            {wellnessCategories.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Wellness Goals</p>
                <div className="flex flex-wrap gap-2">
                  {wellnessCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?wellness=${cat.slug}`}
                      className="text-xs text-brand-muted border border-brand-border bg-white px-3 py-1 rounded-full hover:border-brand-sage hover:text-brand-green transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mb-6">
              <ProductDetailCTA
                country={country}
                outOfStock={outOfStock}
                amazonEnabled={config?.amazonEnabled ?? false}
                amazonUrl={config?.amazonUrl ?? null}
                productSlug={product.slug}
              />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 py-5 border-t border-brand-border">
              {[
                { icon: "🌿", label: "100% Organic" },
                { icon: "🚚", label: country === "IN" ? "Free above ₹499" : "Ships via Amazon" },
                { icon: "✅", label: "Quality Assured" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-xs text-brand-muted font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ProductContentTabs
          longDescription={product.longDescription}
          ingredients={product.ingredients}
          brewingInstructions={product.brewingInstructions}
          benefits={product.benefits}
          tasteProfile={product.tasteProfile ?? null}
          aromaProfile={product.aromaProfile ?? null}
          storageInstructions={product.storageInstructions ?? null}
        />
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="bg-white border-t border-brand-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h2
              className="text-2xl font-bold text-brand-green mb-8"
              style={{ fontFamily: "var(--font-display)" }}
            >
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  country={country}
                  currencySymbol={currencySymbol}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
