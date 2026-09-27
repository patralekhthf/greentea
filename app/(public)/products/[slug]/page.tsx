import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { getProductBySlug, getProducts } from "@/lib/products";
import { COUNTRY_CONFIG, isValidCountry } from "@/lib/ipapi";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductDetailCTA from "@/components/product/ProductDetailCTA";
import ProductCard from "@/components/product/ProductCard";
import ProductContentTabs from "@/components/product/ProductContentTabs";
import ProductSizeSelector from "@/components/product/ProductSizeSelector";
import VegMark from "@/components/product/VegMark";
import { TEA_LINE_LIVE, cookWithLabel, dishTypeLabel, spiceLevel } from "@/lib/catalog";
import { buildImageUrl, TRANSFORMS } from "@/lib/cloudinary-url";

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

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const rawCountry = cookieStore.get("gt_country")?.value ?? "IN";
  const country = isValidCountry(rawCountry) ? rawCountry : "IN";
  const { currencySymbol } = COUNTRY_CONFIG[country];

  const product = await getProductBySlug(slug, country);
  if (!product) notFound();
  // Teas are "coming soon": no detail page, no buying. Send visitors to the teas tab.
  if (product.productLine === "TEA" && !TEA_LINE_LIVE) redirect("/teas");

  const config = product.countryConfigs[0] ?? null;
  const outOfStock = config?.status === "OUT_OF_STOCK";
  const price = config?.price ? parseFloat(config.price.toString()) : null;
  const salePrice = config?.salePrice ? parseFloat(config.salePrice.toString()) : null;
  const rating = config?.displayRating ? parseFloat(config.displayRating.toString()) : null;
  const reviewCount = config?.displayReviewCount ?? null;

  const dish  = dishTypeLabel(product.dishType);
  const spice = spiceLevel(product.spiceLevel);

  // Quick facts — only the ones filled in on the product
  const facts = [
    product.cookTimeMinutes ? { icon: "⏱", label: "Cook time", value: `${product.cookTimeMinutes} min` } : null,
    product.servings        ? { icon: "🍽", label: "Serves",    value: product.servings } : null,
    spice                   ? { icon: "🌶️", label: "Spice",     value: spice.label } : null,
    product.shelfLifeMonths ? { icon: "📦", label: "Best before", value: `${product.shelfLifeMonths} months` } : null,
  ].filter((f): f is { icon: string; label: string; value: string } => f !== null);

  // Related products — same dish type (or any premix), exclude current
  const related = (
    await getProducts({ country, dish: product.dishType ?? undefined })
  ).filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-brand-cream">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-xs text-brand-muted">
            <Link href="/" className="hover:text-brand-green transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-brand-green transition-colors">Shop</Link>
            {dish && (
              <>
                <span>/</span>
                <Link
                  href={`/shop?dish=${product.dishType}`}
                  className="hover:text-brand-green transition-colors"
                >
                  {dish}
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
              <VegMark isVeg={product.isVeg} size={18} />
              {dish && (
                <Link
                  href={`/shop?dish=${product.dishType}`}
                  className="text-xs font-medium text-brand-green bg-brand-mint px-3 py-1 rounded-full hover:bg-brand-sage/20 transition-colors"
                >
                  {dish}
                </Link>
              )}
              {product.noOnionGarlic && (
                <span className="text-xs font-medium text-brand-green border border-brand-sage px-3 py-1 rounded-full">
                  No Onion · No Garlic
                </span>
              )}
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

            {/* Quick facts */}
            {facts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {facts.map((f) => (
                  <div key={f.label} className="bg-white border border-brand-border rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider">
                      {f.icon} {f.label}
                    </p>
                    <p className="text-sm font-semibold text-brand-dark mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            )}

            {product.yieldNote && (
              <p className="text-sm text-brand-dark bg-brand-mint rounded-xl px-4 py-3 mb-6">
                🥘 {product.yieldNote}
              </p>
            )}

            {/* Cook with */}
            {product.pairsWith.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Cook it with</p>
                <div className="flex flex-wrap gap-2">
                  {product.pairsWith.map((slug) => (
                    <Link
                      key={slug}
                      href={`/shop?cookWith=${slug}`}
                      className="text-xs text-brand-muted border border-brand-border bg-white px-3 py-1 rounded-full hover:border-brand-sage hover:text-brand-green transition-colors"
                    >
                      {cookWithLabel(slug)}
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
                cartProduct={
                  price !== null
                    ? {
                        id:       product.id,
                        slug:     product.slug,
                        sku:      product.sku ?? product.slug.toUpperCase().slice(0, 12),
                        name:     product.name,
                        tagline:  product.tagline,
                        price:    salePrice ?? price,
                        sizes:    product.packagingSizes,
                        imageUrl: product.images[0]
                          ? buildImageUrl(product.images[0].cloudinaryPublicId, TRANSFORMS.productCard)
                          : null,
                      }
                    : null
                }
              />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 py-5 border-t border-brand-border">
              {[
                { icon: "💧", label: "Just add water" },
                { icon: "🔥", label: "Heat & cook" },
                { icon: "🏠", label: "Homemade taste" },
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
          flavourProfile={product.tasteProfile}
          cookingInstructions={product.cookingInstructions}
          yieldNote={product.yieldNote}
          storageInstructions={product.storageInstructions}
          shelfLifeMonths={product.shelfLifeMonths}
          ingredients={product.ingredients}
          allergens={product.allergens}
          highlights={product.benefits}
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
