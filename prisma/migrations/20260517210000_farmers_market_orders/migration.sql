-- CreateEnum
CREATE TYPE "FmCartStatus" AS ENUM ('ACTIVE', 'CONVERTED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "FmOrderStatus" AS ENUM ('PLACED', 'CONFIRMED', 'PAYMENT_AWAITED', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "tblgt_fm_carts" (
    "id" TEXT NOT NULL,
    "status" "FmCartStatus" NOT NULL DEFAULT 'ACTIVE',
    "items" JSONB NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "customerName" TEXT,
    "customerMobile" TEXT,
    "paymentMethod" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "countryCode" TEXT,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "pincode" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblgt_fm_carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_fm_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "cartId" TEXT,
    "status" "FmOrderStatus" NOT NULL DEFAULT 'PLACED',
    "customerName" TEXT,
    "customerMobile" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "countryCode" TEXT,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "pincode" TEXT,
    "whatsappSentAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "packedAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblgt_fm_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tblgt_fm_carts_status_createdAt_idx" ON "tblgt_fm_carts"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_fm_orders_orderNumber_key" ON "tblgt_fm_orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_fm_orders_cartId_key" ON "tblgt_fm_orders"("cartId");

-- CreateIndex
CREATE INDEX "tblgt_fm_orders_status_createdAt_idx" ON "tblgt_fm_orders"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "tblgt_fm_orders" ADD CONSTRAINT "tblgt_fm_orders_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "tblgt_fm_carts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
