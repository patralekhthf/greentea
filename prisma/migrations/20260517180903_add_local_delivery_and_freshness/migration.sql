-- AlterTable
ALTER TABLE "tblgt_products" ADD COLUMN     "freshnessDays" INTEGER NOT NULL DEFAULT 14,
ADD COLUMN     "packedOn" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "tblgt_local_delivery_zone" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "addressLabel" TEXT NOT NULL,
    "centerLat" DOUBLE PRECISION NOT NULL,
    "centerLng" DOUBLE PRECISION NOT NULL,
    "radiusKm" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "whatsappNumber" TEXT NOT NULL,
    "bannerText" TEXT NOT NULL DEFAULT 'You''re in our local delivery zone — get ultra-fresh teas via WhatsApp.',
    "freshnessNote" TEXT NOT NULL DEFAULT 'Zero preservatives. Fresh for 14 days from packaging.',
    "paymentNote" TEXT NOT NULL DEFAULT 'Pay via WhatsApp, GPay, or any UPI app.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblgt_local_delivery_zone_pkey" PRIMARY KEY ("id")
);
