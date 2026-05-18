-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");
