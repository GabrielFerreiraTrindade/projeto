import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ProductCategory, SpeedRating, Tire } from "@/types/catalog";

// Camada de acesso a dados do catálogo de pneus — lê da tabela Product no
// Postgres (populada pelo sistema de importação de catálogo, ver
// src/lib/catalog/ e /admin/importar-produtos). A assinatura é a mesma
// usada quando o catálogo ainda era mockado em memória, então nenhum
// componente visual ou serviço que consome TireRepository precisou mudar.

export type TireWidthProfileQuery = {
  width: number;
  aspectRatio: number | null;
};

export interface TireRepository {
  /** Todos os pneus com a mesma largura e perfil, em qualquer aro. */
  findByWidthAndProfile(query: TireWidthProfileQuery): Promise<Tire[]>;
  /** Um pneu pelo slug (página de produto). */
  findBySlug(slug: string): Promise<Tire | null>;
  /** Um pneu pela combinação marca+modelo+medida (URL de SEO). */
  findByBrandModelSize(
    brandSlug: string,
    tireModelSlug: string,
    width: number,
    aspectRatio: number,
    rimDiameter: number,
  ): Promise<Tire | null>;
  /** Outros pneus da mesma marca. */
  findByBrand(brand: string, excludeId: string, limit: number): Promise<Tire[]>;
  /** Outros pneus da mesma categoria/aplicação. */
  findByCategory(
    category: ProductCategory,
    excludeId: string,
    limit: number,
  ): Promise<Tire[]>;
}

export const PRODUCT_INCLUDE = {
  brand: true,
  tireModel: true,
  category: true,
  stock: true,
  reviews: true,
  images: { orderBy: { position: "asc" } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof PRODUCT_INCLUDE }>;

function toInstallments(price: number) {
  const count = price >= 500 ? 10 : price >= 300 ? 8 : 6;
  return { count, value: Math.round((price / count) * 100) / 100 };
}

function toAvailability(quantity: number): Tire["availability"] {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= 3) return "low_stock";
  return "in_stock";
}

export function toTire(product: ProductWithRelations): Tire {
  const price = Number(product.price);
  const compareAtPrice = product.compareAtPrice != null ? Number(product.compareAtPrice) : undefined;
  const reviewCount = product.reviews.length;
  const rating =
    reviewCount > 0
      ? Math.round(
          (product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount) * 10,
        ) / 10
      : 0;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand.name,
    model: product.tireModel.name,
    description: product.description ?? "",
    // Pneus comerciais (van/utilitário) não têm número de perfil — a medida
    // real é escrita "185 R14", sem a barra "/NN".
    size:
      product.aspectRatio != null
        ? `${product.width}/${product.aspectRatio} R${product.rim}`
        : `${product.width} R${product.rim}`,
    category: product.category.slug as ProductCategory,
    price,
    compareAtPrice,
    installments: toInstallments(price),
    rating,
    reviewCount,
    isOffer: compareAtPrice != null,
    freeShipping: price >= 400,
    images: product.images.map((image) => image.url),
    width: product.width,
    aspectRatio: product.aspectRatio,
    rimDiameter: product.rim,
    loadIndex: product.loadIndex ?? "",
    speedRating: (product.speedIndex ?? "H") as SpeedRating,
    runFlat: product.runFlat,
    availability: toAvailability(product.stock?.quantity ?? 0),
    packQuantity: product.packQuantity,
  };
}

class PrismaTireRepository implements TireRepository {
  async findByWidthAndProfile({ width, aspectRatio }: TireWidthProfileQuery): Promise<Tire[]> {
    const products = await prisma.product.findMany({
      where: { width, aspectRatio, isActive: true },
      include: PRODUCT_INCLUDE,
    });
    return products.map(toTire);
  }

  async findBySlug(slug: string): Promise<Tire | null> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_INCLUDE,
    });
    return product ? toTire(product) : null;
  }

  async findByBrandModelSize(
    brandSlug: string,
    tireModelSlug: string,
    width: number,
    aspectRatio: number,
    rimDiameter: number,
  ): Promise<Tire | null> {
    const product = await prisma.product.findFirst({
      where: {
        width,
        aspectRatio,
        rim: rimDiameter,
        brand: { slug: brandSlug },
        tireModel: { slug: tireModelSlug },
      },
      include: PRODUCT_INCLUDE,
    });
    return product ? toTire(product) : null;
  }

  async findByBrand(brand: string, excludeId: string, limit: number): Promise<Tire[]> {
    const products = await prisma.product.findMany({
      where: { brand: { name: brand }, id: { not: excludeId }, isActive: true },
      include: PRODUCT_INCLUDE,
      take: limit,
    });
    return products.map(toTire);
  }

  async findByCategory(
    category: ProductCategory,
    excludeId: string,
    limit: number,
  ): Promise<Tire[]> {
    const products = await prisma.product.findMany({
      where: { category: { slug: category }, id: { not: excludeId }, isActive: true },
      include: PRODUCT_INCLUDE,
      take: limit,
    });
    return products.map(toTire);
  }
}

export const tireRepository: TireRepository = new PrismaTireRepository();
