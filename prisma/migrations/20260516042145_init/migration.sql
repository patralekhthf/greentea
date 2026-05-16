-- CreateEnum
CREATE TYPE "CaffeineLevel" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('TEA_TYPE', 'WELLNESS_GOAL', 'GIFT', 'SEASONAL');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('PRODUCT', 'LIFESTYLE', 'INGREDIENT', 'PACKAGING');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENT', 'FLAT', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'CONTENT_MANAGER');

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('CORPORATE_GIFTING', 'BULK_ORDER', 'DISTRIBUTOR', 'WELLNESS_PARTNERSHIP', 'GENERAL');

-- CreateEnum
CREATE TYPE "NotifyStatus" AS ENUM ('PENDING', 'NOTIFIED');

-- CreateTable
CREATE TABLE "tblgt_countries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "currencySymbol" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblgt_countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "ingredients" TEXT NOT NULL,
    "brewingInstructions" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "caffeineLevel" "CaffeineLevel" NOT NULL DEFAULT 'NONE',
    "tasteProfile" TEXT,
    "aromaProfile" TEXT,
    "nutritionInfo" JSONB,
    "packagingSizes" TEXT[],
    "storageInstructions" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isBestseller" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblgt_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_product_country_config" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "directPurchaseEnabled" BOOLEAN NOT NULL DEFAULT false,
    "amazonEnabled" BOOLEAN NOT NULL DEFAULT false,
    "amazonUrl" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "salePrice" DECIMAL(10,2),
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "displayRating" DECIMAL(3,2),
    "displayReviewCount" INTEGER,
    "status" "StockStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "tblgt_product_country_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryType" "CategoryType" NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tblgt_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_product_categories" (
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "tblgt_product_categories_pkey" PRIMARY KEY ("productId","categoryId")
);

-- CreateTable
CREATE TABLE "tblgt_product_images" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "imageType" "ImageType" NOT NULL DEFAULT 'PRODUCT',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tblgt_product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerMobile" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "shippingAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "paymentGateway" TEXT NOT NULL DEFAULT 'razorpay',
    "paymentReference" TEXT,
    "razorpayOrderId" TEXT,
    "couponCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblgt_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productNameSnapshot" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "tblgt_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_order_addresses" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',

    CONSTRAINT "tblgt_order_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_shipment_tracking" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "courierName" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "trackingUrl" TEXT,
    "shippedAt" TIMESTAMP(3),
    "estimatedDelivery" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "tblgt_shipment_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "countryCode" TEXT,
    "source" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblgt_newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_notify_me_requests" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "countryCode" TEXT,
    "status" "NotifyStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblgt_notify_me_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_inquiries" (
    "id" TEXT NOT NULL,
    "inquiryType" "InquiryType" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "companyName" TEXT,
    "country" TEXT,
    "message" TEXT NOT NULL,
    "isActioned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblgt_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "minOrder" DECIMAL(10,2),
    "countryId" TEXT,
    "expiryAt" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblgt_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_blogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImageUrl" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblgt_blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "position" TEXT NOT NULL,
    "countryId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),

    CONSTRAINT "tblgt_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tblgt_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'CONTENT_MANAGER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblgt_admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_audit_logs" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblgt_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblgt_analytics_events" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "productId" TEXT,
    "countryCode" TEXT,
    "sessionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblgt_analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_countries_code_key" ON "tblgt_countries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_products_slug_key" ON "tblgt_products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_product_country_config_productId_countryId_key" ON "tblgt_product_country_config"("productId", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_categories_slug_key" ON "tblgt_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_orders_orderNumber_key" ON "tblgt_orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_order_addresses_orderId_key" ON "tblgt_order_addresses"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_shipment_tracking_orderId_key" ON "tblgt_shipment_tracking"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_newsletter_subscribers_email_key" ON "tblgt_newsletter_subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_coupons_code_key" ON "tblgt_coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_blogs_slug_key" ON "tblgt_blogs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tblgt_admin_users_email_key" ON "tblgt_admin_users"("email");

-- AddForeignKey
ALTER TABLE "tblgt_product_country_config" ADD CONSTRAINT "tblgt_product_country_config_productId_fkey" FOREIGN KEY ("productId") REFERENCES "tblgt_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblgt_product_country_config" ADD CONSTRAINT "tblgt_product_country_config_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "tblgt_countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblgt_product_categories" ADD CONSTRAINT "tblgt_product_categories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "tblgt_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblgt_product_categories" ADD CONSTRAINT "tblgt_product_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "tblgt_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblgt_product_images" ADD CONSTRAINT "tblgt_product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "tblgt_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblgt_orders" ADD CONSTRAINT "tblgt_orders_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "tblgt_countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblgt_order_items" ADD CONSTRAINT "tblgt_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "tblgt_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblgt_order_items" ADD CONSTRAINT "tblgt_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "tblgt_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblgt_order_addresses" ADD CONSTRAINT "tblgt_order_addresses_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "tblgt_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblgt_shipment_tracking" ADD CONSTRAINT "tblgt_shipment_tracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "tblgt_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblgt_notify_me_requests" ADD CONSTRAINT "tblgt_notify_me_requests_productId_fkey" FOREIGN KEY ("productId") REFERENCES "tblgt_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblgt_coupons" ADD CONSTRAINT "tblgt_coupons_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "tblgt_countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblgt_banners" ADD CONSTRAINT "tblgt_banners_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "tblgt_countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblgt_audit_logs" ADD CONSTRAINT "tblgt_audit_logs_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "tblgt_admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
