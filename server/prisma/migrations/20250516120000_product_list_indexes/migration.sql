-- CreateIndex
CREATE INDEX "products_isPublished_createdAt_idx" ON "products"("isPublished", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "products_isPublished_price_idx" ON "products"("isPublished", "price");
