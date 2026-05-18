-- LocalDeliveryZone: UPI payment config (admin-controlled)
ALTER TABLE "tblgt_local_delivery_zone"
  ADD COLUMN "upiVpa"          TEXT,
  ADD COLUMN "upiPayeeName"    TEXT,
  ADD COLUMN "upiInstructions" TEXT;

-- FarmersMarketOrder: customer-claimed payment fields
ALTER TABLE "tblgt_fm_orders"
  ADD COLUMN "upiVpa"             TEXT,
  ADD COLUMN "upiUtr"             TEXT,
  ADD COLUMN "paymentSubmittedAt" TIMESTAMP(3),
  ADD COLUMN "paymentVerified"    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN "paymentVerifiedAt"  TIMESTAMP(3);
