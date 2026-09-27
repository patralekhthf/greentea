-- Premix pivot: add a product line + premix detail fields.
-- Tea fields are kept so the tea line can be relaunched later.

-- CreateEnum
CREATE TYPE "ProductLine" AS ENUM ('TEA', 'PREMIX');

-- CreateEnum
CREATE TYPE "SpiceLevel" AS ENUM ('MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT');

-- Every product that exists today is a tea, so backfill TEA,
-- then switch the default to PREMIX for everything created from now on.
ALTER TABLE "tblgt_products" ADD COLUMN "productLine" "ProductLine" NOT NULL DEFAULT 'TEA';
ALTER TABLE "tblgt_products" ALTER COLUMN "productLine" SET DEFAULT 'PREMIX';

-- Premix detail fields
ALTER TABLE "tblgt_products"
  ADD COLUMN "spiceLevel"          "SpiceLevel",
  ADD COLUMN "dishType"            TEXT,
  ADD COLUMN "pairsWith"           TEXT[],
  ADD COLUMN "cookTimeMinutes"     INTEGER,
  ADD COLUMN "servings"            TEXT,
  ADD COLUMN "yieldNote"           TEXT,
  ADD COLUMN "cookingInstructions" TEXT,
  ADD COLUMN "isVeg"               BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "noOnionGarlic"       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "allergens"           TEXT,
  ADD COLUMN "shelfLifeMonths"     INTEGER;

-- Brewing instructions only apply to teas
ALTER TABLE "tblgt_products" ALTER COLUMN "brewingInstructions" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "tblgt_products_productLine_status_idx" ON "tblgt_products"("productLine", "status");
