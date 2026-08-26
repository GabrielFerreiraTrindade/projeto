import { prisma } from "@/lib/prisma";
import { tireRepository } from "@/lib/repositories/tire-repository";
import type { Tire } from "@/types/catalog";

// Produtos exibidos na home vêm do mesmo catálogo usado pela busca por
// medida/veículo (Product no Postgres), para que os links dos cards sempre
// apontem para uma página de produto que existe.

const OFFER_LIMIT = 6;
const BEST_SELLER_LIMIT = 8;

export async function getOfferProducts(): Promise<Tire[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, compareAtPrice: { not: null } },
    take: OFFER_LIMIT,
    select: { slug: true },
  });
  const tires = await Promise.all(products.map((p) => tireRepository.findBySlug(p.slug)));
  return tires.filter((tire): tire is Tire => tire !== null);
}

export async function getBestSellerProducts(): Promise<Tire[]> {
  // "Mais vendidos" real ainda não existe (nenhum pedido além dos de
  // demonstração) — usa a pontuação de popularidade do catálogo (nunca
  // inventada, ver ProductScore) como proxy, depois desempata por
  // avaliações reais. Só o melhor produto de cada marca entra na disputa
  // pelo top N, pra seção não ficar dominada pelos vários tamanhos de uma
  // marca só (que empatam facilmente no mesmo score).
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { score: true, reviews: true },
  });

  const scoreWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1, UNKNOWN: 0 };

  const bestPerBrand = new Map<string, { slug: string; weight: number; reviewCount: number }>();
  for (const product of products) {
    const candidate = {
      slug: product.slug,
      weight: scoreWeight[product.score?.popularity ?? "UNKNOWN"] ?? 0,
      reviewCount: product.reviews.length,
    };
    const current = bestPerBrand.get(product.brandId);
    if (
      !current ||
      candidate.weight > current.weight ||
      (candidate.weight === current.weight && candidate.reviewCount > current.reviewCount)
    ) {
      bestPerBrand.set(product.brandId, candidate);
    }
  }

  const ranked = Array.from(bestPerBrand.values())
    .sort((a, b) => b.weight - a.weight || b.reviewCount - a.reviewCount)
    .slice(0, BEST_SELLER_LIMIT);

  const tires = await Promise.all(ranked.map((item) => tireRepository.findBySlug(item.slug)));
  return tires.filter((tire): tire is Tire => tire !== null);
}
