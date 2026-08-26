-- AlterTable
ALTER TABLE "products" ADD COLUMN "packQuantity" INTEGER NOT NULL DEFAULT 1;

-- DropIndex
DROP INDEX "products_brandId_sizeId_rankingPosition_key";

-- CreateIndex
CREATE UNIQUE INDEX "products_brandId_sizeId_rankingPosition_packQuantity_key" ON "products"("brandId", "sizeId", "rankingPosition", "packQuantity");
