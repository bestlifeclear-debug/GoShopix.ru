-- Способ оплаты при оформлении (карта / при получении)
ALTER TABLE "orders" ADD COLUMN "paymentMethod" TEXT;
