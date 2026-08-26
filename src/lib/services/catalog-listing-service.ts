import { prisma } from "@/lib/prisma";
import { PRODUCT_INCLUDE, toTire } from "@/lib/repositories/tire-repository";
import type { Tire } from "@/types/catalog";

// Listagens simples (sem filtros de faceta) usadas pelas páginas
// /ofertas, /marcas/[slug] e /categoria/[slug] — todas paginadas com o
// mesmo tamanho de página do buscador por medida.

export const LISTING_PAGE_SIZE = 12;

export type CatalogListingResult = {
  tires: Tire[];
  total: number;
  page: number;
  totalPages: number;
};

async function paginate(
  where: NonNullable<Parameters<typeof prisma.product.findMany>[0]>["where"],
  page: number,
): Promise<CatalogListingResult> {
  const safePage = Math.max(1, page);
  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / LISTING_PAGE_SIZE));
  const currentPage = Math.min(safePage, totalPages);

  const products = await prisma.product.findMany({
    where,
    include: PRODUCT_INCLUDE,
    orderBy: [{ width: "asc" }, { aspectRatio: "asc" }, { rim: "asc" }],
    skip: (currentPage - 1) * LISTING_PAGE_SIZE,
    take: LISTING_PAGE_SIZE,
  });

  return {
    tires: products.map(toTire),
    total,
    page: currentPage,
    totalPages,
  };
}

export function listOffers(page: number): Promise<CatalogListingResult> {
  return paginate({ isActive: true, compareAtPrice: { not: null } }, page);
}

export function listByBrandSlug(brandSlug: string, page: number): Promise<CatalogListingResult> {
  return paginate({ isActive: true, brand: { slug: brandSlug } }, page);
}

export function listByCategorySlug(categorySlug: string, page: number): Promise<CatalogListingResult> {
  return paginate({ isActive: true, category: { slug: categorySlug } }, page);
}
