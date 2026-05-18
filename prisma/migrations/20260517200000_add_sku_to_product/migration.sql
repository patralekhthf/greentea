-- AlterTable
ALTER TABLE "tblgt_products" ADD COLUMN "sku" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_products_sku_key" ON "tblgt_products"("sku");
