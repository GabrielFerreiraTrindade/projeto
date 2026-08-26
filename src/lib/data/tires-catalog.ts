import { generateAgroCatalog } from "@/lib/catalog/agro-generator";
import type { GeneratedProduct } from "@/lib/catalog/catalog-generator";
import { generateCatalog } from "@/lib/catalog/catalog-generator";
import { generateKitCatalog, kitImagePath } from "@/lib/catalog/kit-generator";
import { MODEL_IMAGES } from "@/lib/catalog/model-images";
import { generateMotoCatalog } from "@/lib/catalog/moto-generator";
import { generateTruckCatalog } from "@/lib/catalog/truck-generator";
import { generateVanCatalog } from "@/lib/catalog/van-generator";
import type { ProductCategory, SpeedRating, Tire } from "@/types/catalog";

const IMAGES_BY_MODEL = new Map(
  MODEL_IMAGES.map((entry) => [`${entry.brandName}__${entry.tireModelSlug}`, entry.images]),
);

// Espelho estático (sem Prisma/banco) do mesmo catálogo gerado por
// generateCatalog() — usado apenas pelo carrinho (src/lib/cart/), que
// resolve produtos de forma síncrona no cliente a partir do localStorage e
// não pode fazer uma chamada async ao banco durante a renderização.
//
// Os ids aqui (item.sku) são os MESMOS ids usados como Product.id no
// Postgres (ver prisma/seed.ts: `id: item.sku`), então um productId salvo
// no carrinho sempre resolve para o mesmo produto real do banco. Qualquer
// decisão que realmente importa (preço final, estoque, criação do pedido)
// é sempre revalidada a partir do banco no checkout
// (src/lib/services/checkout-service.ts) — este catálogo estático serve só
// para exibição no carrinho antes de finalizar a compra.

function toInstallments(price: number) {
  const count = price >= 500 ? 10 : price >= 300 ? 8 : 6;
  return { count, value: Math.round((price / count) * 100) / 100 };
}

function toTire(item: GeneratedProduct): Tire {
  return {
    id: item.sku,
    slug: item.slug,
    name: item.name,
    brand: item.brandName,
    model: item.tireModelName,
    description: item.description,
    size:
      item.aspectRatio != null
        ? `${item.width}/${item.aspectRatio} R${item.rim}`
        : `${item.width} R${item.rim}`,
    category: item.categorySlug as ProductCategory,
    price: item.price,
    compareAtPrice: item.compareAtPrice ?? undefined,
    installments: toInstallments(item.price),
    rating: 0,
    reviewCount: 0,
    isOffer: item.compareAtPrice != null,
    freeShipping: item.price >= 400,
    images:
      item.packQuantity > 1
        ? [kitImagePath(item.brandName, item.tireModelSlug, item.packQuantity)]
        : (IMAGES_BY_MODEL.get(`${item.brandName}__${item.tireModelSlug}`) ?? []),
    width: item.width,
    aspectRatio: item.aspectRatio,
    rimDiameter: item.rim,
    loadIndex: item.loadIndex,
    speedRating: item.speedIndex as SpeedRating,
    runFlat: item.runFlat,
    availability: item.stockQuantity > 0 ? "in_stock" : "out_of_stock",
    packQuantity: item.packQuantity,
  };
}

export const tiresCatalog: Tire[] = [
  ...generateCatalog(),
  ...generateMotoCatalog(),
  ...generateVanCatalog(),
  ...generateTruckCatalog(),
  ...generateAgroCatalog(),
  ...generateKitCatalog(),
].map(toTire);
