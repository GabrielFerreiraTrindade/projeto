-- CreateEnum
CREATE TYPE "ScoreLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "RankingPosition" AS ENUM ('FIRST', 'SECOND');

-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('PENDING_PERMISSION', 'MANUFACTURER_AUTHORIZED', 'LICENSED', 'OWN');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('PASSENGER', 'SUV', 'LIGHT_TRUCK', 'MOTORCYCLE');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "aspectRatio" INTEGER NOT NULL,
ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "gtin" TEXT,
ADD COLUMN     "imageStatus" "ImageStatus" NOT NULL DEFAULT 'PENDING_PERMISSION',
ADD COLUMN     "loadIndex" TEXT,
ADD COLUMN     "rankingPosition" "RankingPosition" NOT NULL,
ADD COLUMN     "rim" INTEGER NOT NULL,
ADD COLUMN     "runFlat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "season" TEXT NOT NULL DEFAULT 'ALL_SEASON',
ADD COLUMN     "source" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "speedIndex" TEXT,
ADD COLUMN     "tireModelId" TEXT NOT NULL,
ADD COLUMN     "vehicleType" "VehicleType" NOT NULL DEFAULT 'PASSENGER',
ADD COLUMN     "width" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "tire_models" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tire_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tire_size_demand" (
    "id" TEXT NOT NULL,
    "tireSizeId" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "aspectRatio" INTEGER NOT NULL,
    "rim" INTEGER NOT NULL,
    "demandScore" "ScoreLevel" NOT NULL,
    "brazilRelevance" "ScoreLevel" NOT NULL,
    "minasGeraisRelevance" "ScoreLevel" NOT NULL,
    "sources" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tire_size_demand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sources" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "url" TEXT,
    "note" TEXT,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_scores" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "popularity" "ScoreLevel" NOT NULL,
    "salesVolume" "ScoreLevel" NOT NULL,
    "availability" "ScoreLevel" NOT NULL,
    "relevance" "ScoreLevel" NOT NULL,
    "distributorPresence" "ScoreLevel" NOT NULL,
    "retailerPresence" "ScoreLevel" NOT NULL,
    "regionalRelevance" "ScoreLevel" NOT NULL,
    "overall" "ScoreLevel" NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tire_models_brandId_idx" ON "tire_models"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "tire_models_brandId_slug_key" ON "tire_models"("brandId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "tire_size_demand_tireSizeId_key" ON "tire_size_demand"("tireSizeId");

-- CreateIndex
CREATE INDEX "product_sources_productId_idx" ON "product_sources"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_scores_productId_key" ON "product_scores"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "products_gtin_key" ON "products"("gtin");

-- CreateIndex
CREATE INDEX "products_tireModelId_idx" ON "products"("tireModelId");

-- CreateIndex
CREATE UNIQUE INDEX "products_brandId_sizeId_rankingPosition_key" ON "products"("brandId", "sizeId", "rankingPosition");

-- AddForeignKey
ALTER TABLE "tire_models" ADD CONSTRAINT "tire_models_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tire_size_demand" ADD CONSTRAINT "tire_size_demand_tireSizeId_fkey" FOREIGN KEY ("tireSizeId") REFERENCES "tire_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tireModelId_fkey" FOREIGN KEY ("tireModelId") REFERENCES "tire_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sources" ADD CONSTRAINT "product_sources_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_scores" ADD CONSTRAINT "product_scores_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

