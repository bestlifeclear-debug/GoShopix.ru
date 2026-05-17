-- Order status enum migration (uppercase -> lowercase, PAID -> processing, add refunded)

CREATE TYPE "OrderStatus_new" AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING (
  CASE "status"::text
    WHEN 'PENDING' THEN 'pending'
    WHEN 'PAID' THEN 'processing'
    WHEN 'PROCESSING' THEN 'processing'
    WHEN 'SHIPPED' THEN 'shipped'
    WHEN 'DELIVERED' THEN 'delivered'
    WHEN 'CANCELLED' THEN 'cancelled'
    ELSE 'pending'
  END::"OrderStatus_new"
);

ALTER TABLE "order_status_history" ALTER COLUMN "status" TYPE "OrderStatus_new" USING (
  CASE "status"::text
    WHEN 'PENDING' THEN 'pending'
    WHEN 'PAID' THEN 'processing'
    WHEN 'PROCESSING' THEN 'processing'
    WHEN 'SHIPPED' THEN 'shipped'
    WHEN 'DELIVERED' THEN 'delivered'
    WHEN 'CANCELLED' THEN 'cancelled'
    ELSE 'pending'
  END::"OrderStatus_new"
);

DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending';

-- Tracking fields
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "carrier" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "carrierStatus" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "carrierStatusAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "orders_trackingNumber_idx" ON "orders"("trackingNumber");

-- Status history metadata
CREATE TYPE "StatusActorRole" AS ENUM ('CUSTOMER', 'SELLER', 'ADMIN', 'SYSTEM');
ALTER TABLE "order_status_history" ADD COLUMN IF NOT EXISTS "reason" TEXT;
ALTER TABLE "order_status_history" ADD COLUMN IF NOT EXISTS "changedById" TEXT;
ALTER TABLE "order_status_history" ADD COLUMN IF NOT EXISTS "actorRole" "StatusActorRole";

ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changedById_fkey"
  FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Notifications
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "data" JSONB,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "user_notification_settings" (
  "userId" TEXT NOT NULL,
  "emailOrderStatus" BOOLEAN NOT NULL DEFAULT true,
  "inAppOrderStatus" BOOLEAN NOT NULL DEFAULT true,
  "emailMarketing" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "user_notification_settings_pkey" PRIMARY KEY ("userId")
);
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Background jobs
CREATE TYPE "JobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE "JobType" AS ENUM ('SEND_EMAIL', 'SEND_WEBHOOK', 'CHECK_CARRIER_STATUS', 'AUTO_ORDER_STATUS');

CREATE TABLE IF NOT EXISTS "background_jobs" (
  "id" TEXT NOT NULL,
  "type" "JobType" NOT NULL,
  "status" "JobStatus" NOT NULL DEFAULT 'pending',
  "payload" JSONB NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastError" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "background_jobs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "background_jobs_status_runAt_idx" ON "background_jobs"("status", "runAt");
ALTER TABLE "background_jobs" ADD CONSTRAINT "background_jobs_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Webhooks
CREATE TABLE IF NOT EXISTS "webhook_subscriptions" (
  "id" TEXT NOT NULL,
  "sellerId" TEXT,
  "url" TEXT NOT NULL,
  "secret" TEXT NOT NULL,
  "events" TEXT[] DEFAULT ARRAY['order.status_changed']::TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "webhook_subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "webhook_subscriptions_sellerId_idx" ON "webhook_subscriptions"("sellerId");
ALTER TABLE "webhook_subscriptions" ADD CONSTRAINT "webhook_subscriptions_sellerId_fkey"
  FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
