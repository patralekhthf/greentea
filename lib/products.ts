import { db } from "./db";
import type { Prisma, ProductLine, SpiceLevel } from "@prisma/client";

export type ProductForCard = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  shortDescription: string;
  productLine: ProductLine;
  spiceLevel: SpiceLevel | null;
  dishType: string | null;
  cookTimeMinutes: number | null;
  isVeg: boolean;
  noOnionGarlic: boolean;
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
  line?: ProductLine;  // defaults to PREMIX
  country?: string;
  search?: string;
  dish?: string;       // DISH_TYPES slug
  cookWith?: string;   // COOK_WITH slug
  spice?: string;      // SpiceLevel
  noOnionGarlic?: boolean;
  sort?: string;
};

const SPICE_VALUES: SpiceLevel[] = ["MILD", "MEDIUM", "HOT", "EXTRA_HOT"];

export async function getProducts(params: GetProductsParams): Promise<ProductForCard[]> {
  const {
    line = "PREMIX",
    country = "IN",
    search,
    dish,
    cookWith,
    spice,
    noOnionGarlic,
    sort = "newest",
  } = params;

  const spiceFilter = SPICE_VALUES.find((v) => v === spice);

  const where: Prisma.ProductWhereInput = {
    productLine: line,
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
            { tagline: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(dish ? { dishType: dish } : {}),
    ...(cookWith ? { pairsWith: { has: cookWith } } : {}),
    ...(spiceFilter ? { spiceLevel: spiceFilter } : {}),
    ...(noOnionGarlic ? { noOnionGarlic: true } : {}),
  };

  const rows = await db.product.findMany({
    where,
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
  const products: ProductForCard[] = rows.map((p) => {
    const config = p.countryConfigs[0] ?? null;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      tagline: p.tagline,
      shortDescription: p.shortDescription,
      productLine: p.productLine,
      spiceLevel: p.spiceLevel,
      dishType: p.dishType,
      cookTimeMinutes: p.cookTimeMinutes,
      isVeg: p.isVeg,
      noOnionGarlic: p.noOnionGarlic,
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
