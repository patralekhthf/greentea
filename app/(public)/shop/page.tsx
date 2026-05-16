import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { getProducts } from "@/lib/products";
import { COUNTRY_CONFIG, isValidCountry } from "@/lib/ipapi";
import ShopClient from "./ShopClient";
import ShopCategoryQuickLinks from "@/components/product/ShopCategoryQuickLinks";

export const metadata: Metadata = {
  title: "Shop All Teas",
  description:
    "Browse our full collection of premium organic green and herbal teas. Filter by wellness goal, tea type, or caffeine level.",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function getString(val: string | string[] | undefined): string | undefined {
  if (!val) return undefined;
  return Array.isArray(val) ? val[0] : val;
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();

  // Resolve country from cookie
  const rawCountry = cookieStore.get("gt_country")?.value ?? "IN";
  const country = isValidCountry(rawCountry) ? rawCountry : "IN";
  const { currencySymbol } = COUNTRY_CONFIG[country];

  // Fetch products from DB
  const products = await getProducts({
    country,
    search:   getString(params.search),
    category: getString(params.category),
    wellness: getString(params.wellness),
    sort:     getString(params.sort),
    caffeine: getString(params.caffeine),
  });

  // Active filter labels for the breadcrumb/header
  const activeSearch   = getString(params.search);
  const activeCategory = getString(params.category);
  const activeWellness = getString(params.wellness);

  return (
    <div className="min-h-screen bg-brand-cream">

      {/* Page header */}
      <div className="bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-brand-muted mb-4">
            <Link href="/" className="hover:text-brand-green transition-colors">Home</Link>
            <span>/</span>
            <span className="text-brand-dark font-medium">Shop</span>
            {activeCategory && (
              <>
                <span>/</span>
                <span className="text-brand-dark font-medium capitalize">
                  {activeCategory.replace(/-/g, " ")}
                </span>
              </>
            )}
            {activeWellness && (
              <>
                <span>/</span>
                <span className="text-brand-dark font-medium capitalize">
                  {activeWellness.replace(/-/g, " ")}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1
                className="text-3xl sm:text-4xl font-bold text-brand-green"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {activeSearch
                  ? `Results for "${activeSearch}"`
                  : activeCategory
                  ? activeCategory.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                  : activeWellness
                  ? activeWellness.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                  : "Our Collection"}
              </h1>
              <p className="text-brand-muted mt-1 text-sm">
                Premium organic teas · {country === "IN" ? "Free delivery above ₹499" : "Ships globally via Amazon"}
              </p>
            </div>

            {/* Category quick links */}
            <ShopCategoryQuickLinks />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ShopClient
          products={products}
          country={country}
          currencySymbol={currencySymbol}
        />
      </div>
    </div>
  );
}
