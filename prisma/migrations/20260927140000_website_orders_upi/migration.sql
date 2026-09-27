-- Website (all-India) orders paid by UPI + UTR, verified manually in admin.

-- AlterTable
ALTER TABLE "tblgt_orders"
  ADD COLUMN "paymentSubmittedAt" TIMESTAMP(3),
  ADD COLUMN "paymentVerifiedAt"  TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tblgt_order_items"
  ADD COLUMN "skuSnapshot"  TEXT,
  ADD COLUMN "sizeSnapshot" TEXT;
