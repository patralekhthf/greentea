-- Channel pricing: config block + making cost per product (admin Pricing page).
CREATE TABLE "tblgt_pricing_config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "values" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblgt_pricing_config_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tblgt_product_pricing" (
    "productId" TEXT NOT NULL,
    "makingCost" DECIMAL(10,2),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblgt_product_pricing_pkey" PRIMARY KEY ("productId")
);

ALTER TABLE "tblgt_product_pricing" ADD CONSTRAINT "tblgt_product_pricing_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "tblgt_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
