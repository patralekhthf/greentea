import type { Metadata } from "next";
import { db } from "@/lib/db";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  const countries = await db.country.findMany({ orderBy: { name: "asc" } });

  const initial: ProductFormValues = {
    sku: "", name: "", slug: "", tagline: "", shortDescription: "",
    longDescription: "", ingredients: "", brewingInstructions: "",
    benefits: "", caffeineLevel: "NONE", tasteProfile: "", aromaProfile: "",
    packagingSizes: "100g", storageInstructions: "Store in a cool, dry place and keep in an airtight container",
    status: "DRAFT",
    isBestseller: false, isFeatured: false,
    packedOn: "", freshnessDays: 14,
    productLine: "PREMIX",
    spiceLevel: "", dishType: "", pairsWith: [], cookTimeMinutes: "",
    servings: "", yieldNote: "", cookingInstructions: "",
    isVeg: true, noOnionGarlic: false, allergens: "", shelfLifeMonths: "6",
    existingImages: [],
    countryConfigs: countries.map((c) => ({
      countryId: c.id, code: c.code, price: "", salePrice: "",
      amazonEnabled: c.code !== "IN", amazonUrl: "",
      directPurchaseEnabled: c.code === "IN",
      displayRating: "", displayReviewCount: "",
    })),
  };

  return <ProductForm initial={initial} />;
}
