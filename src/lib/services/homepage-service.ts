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
  // avaliações reais.
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { score: true, reviews: true },
    take: 60,
  });

  const scoreWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1, UNKNOWN: 0 };
  const ranked = products
    .map((product) => ({
      slug: product.slug,
      weight: scoreWeight[product.score?.popularity ?? "UNKNOWN"] ?? 0,
      reviewCount: product.reviews.length,
    }))
    .sort((a, b) => b.weight - a.weight || b.reviewCount - a.reviewCount)
    .slice(0, BEST_SELLER_LIMIT);

  const tires = await Promise.all(ranked.map((item) => tireRepository.findBySlug(item.slug)));
  return tires.filter((tire): tire is Tire => tire !== null);
}
