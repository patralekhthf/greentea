import { db } from "./db";
import type { CaffeineLevel } from "@prisma/client";

export type ProductForCard = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  shortDescription: string;
  caffeineLevel: CaffeineLevel;
  isBestseller: boolean;
  isFeatured: boolean;
  primaryImage: string | null; // Cloudinary public_id
  countryConfig: {
    price: string;
    salePrice: string | null;
    displayRating: string | null;
    displayReviewCount: number | null;
    directPurchaseEnabled: boolean;
    amazonEnabled: boolean;
    amazonUrl: string | null;
    status: string;
  } | null;
  categoryNames: string[];
};

export type GetProductsParams = {
  country?: string;
  search?: string;
  category?: string;   // tea type slug
  wellness?: string;   // wellness goal slug
  sort?: string;
  caffeine?: string;
};

export async function getProducts(params: GetProductsParams): Promise<ProductForCard[]> {
  const {
    country = "IN",
    search,
    category,
    wellness,
    sort = "newest",
    caffeine,
  } = params;

  const rows = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      countryConfigs: {
        some: {
          country: { code: country },
          isAvailable: true,
        },
      },
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { shortDescription: { contains: search, mode: "insensitive" } },
              { ingredients: { contains: search, mode: "insensitive" } },
              { benefits: { contains: search, mode: "insensitive" } },
              { tagline: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(caffeine ? { caffeineLevel: caffeine as CaffeineLevel } : {}),
      ...(category
        ? {
            categories: {
              some: {
                category: { slug: category, categoryType: "TEA_TYPE" },
              },
            },
          }
        : {}),
      ...(wellness
        ? {
            categories: {
              some: {
                category: { slug: wellness, categoryType: "WELLNESS_GOAL" },
              },
            },
          }
        : {}),
    },
    include: {
      countryConfigs: {
        where: { country: { code: country } },
      },
      categories: {
        include: { category: { select: { name: true } } },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { cloudinaryPublicId: true },
      },
    },
    orderBy:
      sort === "bestseller"
        ? [{ isBestseller: "desc" }, { createdAt: "desc" }]
        : sort === "featured"
        ? [{ isFeatured: "desc" }, { createdAt: "desc" }]
        : { createdAt: "desc" },
  });

  // Shape into card-friendly format + handle price sorting in app code
  let products: ProductForCard[] = rows.map((p) => {
    const config = p.countryConfigs[0] ?? null;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      tagline: p.tagline,
      shortDescription: p.shortDescription,
      caffeineLevel: p.caffeineLevel,
      isBestseller: p.isBestseller,
      isFeatured: p.isFeatured,
      primaryImage: p.images[0]?.cloudinaryPublicId ?? null,
      countryConfig: config
        ? {
            price: config.price.toString(),
            salePrice: config.salePrice?.toString() ?? null,
            displayRating: config.displayRating?.toString() ?? null,
            displayReviewCount: config.displayReviewCount,
            directPurchaseEnabled: config.directPurchaseEnabled,
            amazonEnabled: config.amazonEnabled,
            amazonUrl: config.amazonUrl,
            status: config.status,
          }
        : null,
      categoryNames: p.categories.map((c) => c.category.name),
    };
  });

  // Price sort (needs app-level sort since price is in nested relation)
  if (sort === "price_asc") {
    products.sort((a, b) =>
      parseFloat(a.countryConfig?.price ?? "0") - parseFloat(b.countryConfig?.price ?? "0")
    );
  } else if (sort === "price_desc") {
    products.sort((a, b) =>
      parseFloat(b.countryConfig?.price ?? "0") - parseFloat(a.countryConfig?.price ?? "0")
    );
  } else if (sort === "rating") {
    products.sort((a, b) =>
      parseFloat(b.countryConfig?.displayRating ?? "0") -
      parseFloat(a.countryConfig?.displayRating ?? "0")
    );
  }

  return products;
}

export async function getProductBySlug(slug: string, country: string = "IN") {
  return db.product.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      countryConfigs: {
        where: { country: { code: country } },
        include: { country: true },
      },
      categories: {
        include: { category: true },
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }],
      },
    },
  });
}
