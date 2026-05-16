import type { Metadata } from "next";
import { db } from "@/lib/db";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  const countries = await db.country.findMany({ orderBy: { name: "asc" } });

  const initial: ProductFormValues = {
    name: "", slug: "", tagline: "", shortDescription: "",
    longDescription: "", ingredients: "", brewingInstructions: "",
    benefits: "", caffeineLevel: "NONE", tasteProfile: "", aromaProfile: "",
    packagingSizes: "", storageInstructions: "", status: "DRAFT",
    isBestseller: false, isFeatured: false,
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
