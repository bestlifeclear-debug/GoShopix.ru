-- Passwordless auth: optional email/password, profile name, OTP table

CREATE TYPE "OtpChannel" AS ENUM ('PHONE', 'EMAIL');
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'CHANGE_PHONE', 'CHANGE_EMAIL');

CREATE TABLE "auth_otps" (
    "id" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "channel" "OtpChannel" NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "userId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_otps_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "auth_otps_target_purpose_idx" ON "auth_otps"("target", "purpose");

ALTER TABLE "auth_otps" ADD CONSTRAINT "auth_otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Profile: merge names, drop username
ALTER TABLE "profiles" ADD COLUMN "name" TEXT;

UPDATE "profiles"
SET "name" = TRIM(CONCAT(COALESCE("firstName", ''), ' ', COALESCE("lastName", '')))
WHERE "firstName" IS NOT NULL OR "lastName" IS NOT NULL;

UPDATE "profiles" SET "name" = NULL WHERE "name" = '';

DROP INDEX IF EXISTS "profiles_username_key";
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "username";
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "firstName";
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "lastName";

-- User: optional email and password
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL;

DROP TABLE IF EXISTS "password_reset_tokens";
