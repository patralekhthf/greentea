import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit Product" };

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, countries] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }] },
        countryConfigs: { include: { country: true } },
      },
    }),
    db.country.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const initial: ProductFormValues = {
    id: product.id,
    sku:                 product.sku ?? "",
    productLine:         product.productLine,
    name:                product.name,
    slug:                product.slug,
    tagline:             product.tagline ?? "",
    shortDescription:    product.shortDescription,
    longDescription:     product.longDescription,
    ingredients:         product.ingredients,
    brewingInstructions: product.brewingInstructions ?? "",
    benefits:            product.benefits,
    caffeineLevel:       product.caffeineLevel,
    tasteProfile:        product.tasteProfile ?? "",
    aromaProfile:        product.aromaProfile ?? "",
    packagingSizes:      product.packagingSizes.join(", "),
    storageInstructions: product.storageInstructions ?? "",
    status:              product.status,
    isBestseller:        product.isBestseller,
    isFeatured:          product.isFeatured,
    packedOn:            product.packedOn ? new Date(product.packedOn).toISOString().slice(0, 10) : "",
    freshnessDays:       product.freshnessDays,
    spiceLevel:          product.spiceLevel ?? "",
    dishType:            product.dishType ?? "",
    pairsWith:           product.pairsWith,
    cookTimeMinutes:     product.cookTimeMinutes?.toString() ?? "",
    servings:            product.servings ?? "",
    yieldNote:           product.yieldNote ?? "",
    cookingInstructions: product.cookingInstructions ?? "",
    isVeg:               product.isVeg,
    noOnionGarlic:       product.noOnionGarlic,
    allergens:           product.allergens ?? "",
    shelfLifeMonths:     product.shelfLifeMonths?.toString() ?? "",
    existingImages:      product.images.map((img) => ({
      id:                 img.id,
      cloudinaryPublicId: img.cloudinaryPublicId,
      altText:            img.altText,
      isPrimary:          img.isPrimary,
    })),
    countryConfigs: countries.map((c) => {
      const cc = product.countryConfigs.find((x) => x.country.code === c.code);
      return {
        countryId:            c.id,
        code:                 c.code,
        price:                cc?.price?.toString() ?? "",
        salePrice:            cc?.salePrice?.toString() ?? "",
        amazonEnabled:        cc?.amazonEnabled ?? c.code !== "IN",
        amazonUrl:            cc?.amazonUrl ?? "",
        directPurchaseEnabled: cc?.directPurchaseEnabled ?? c.code === "IN",
        displayRating:        cc?.displayRating?.toString() ?? "",
        displayReviewCount:   cc?.displayReviewCount?.toString() ?? "",
      };
    }),
  };

  return <ProductForm initial={initial} />;
}
