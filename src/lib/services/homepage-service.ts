import { prisma } from "@/lib/prisma";
import { tireRepository } from "@/lib/repositories/tire-repository";
import type { Tire } from "@/types/catalog";

// Produtos exibidos na home vêm do mesmo catálogo usado pela busca por
// medida/veículo (Product no Postgres), para que os links dos cards sempre
// apontem para uma página de produto que existe.

const BEST_SELLER_LIMIT = 8;
const SCORE_WEIGHT: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1, UNKNOWN: 0 };

type BestSellerWinner = {
  slug: string;
  tireModelId: string;
  sizeId: string;
  weight: number;
  reviewCount: number;
};

// "Mais vendidos" real ainda não existe (nenhum pedido além dos de
// demonstração) — usa a pontuação de popularidade do catálogo (nunca
// inventada, ver ProductScore) como proxy, depois desempata por avaliações
// reais. Só o melhor produto de cada marca entra na disputa pelo top N, pra
// seção não ficar dominada pelos vários tamanhos de uma marca só (que
// empatam facilmente no mesmo score).
async function getBestSellerWinners(): Promise<BestSellerWinner[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { score: true, reviews: true },
  });

  const bestPerBrand = new Map<string, BestSellerWinner>();
  for (const product of products) {
    const candidate: BestSellerWinner = {
      slug: product.slug,
      tireModelId: product.tireModelId,
      sizeId: product.sizeId,
      weight: SCORE_WEIGHT[product.score?.popularity ?? "UNKNOWN"] ?? 0,
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

  return Array.from(bestPerBrand.values())
    .sort((a, b) => b.weight - a.weight || b.reviewCount - a.reviewCount)
    .slice(0, BEST_SELLER_LIMIT);
}

export async function getBestSellerProducts(): Promise<Tire[]> {
  const winners = await getBestSellerWinners();
  const tires = await Promise.all(winners.map((item) => tireRepository.findBySlug(item.slug)));
  return tires.filter((tire): tire is Tire => tire !== null);
}

// "Produtos em promoção" da home: só os kits (2 e 4 pneus) dos modelos mais
// vendidos — pedido explícito do cliente, pra essa seção não misturar com
// pneu avulso nem com ofertas de modelos fora do top de vendas. A página
// /ofertas continua mostrando toda oferta do catálogo (ver listOffers).
export async function getBestSellerKitOffers(): Promise<Tire[]> {
  const winners = await getBestSellerWinners();
  if (winners.length === 0) return [];

  const kits = await prisma.product.findMany({
    where: {
      isActive: true,
      packQuantity: { in: [2, 4] },
      OR: winners.map((winner) => ({ tireModelId: winner.tireModelId, sizeId: winner.sizeId })),
    },
    select: { slug: true, packQuantity: true, tireModelId: true },
  });

  const winnerOrder = new Map(winners.map((winner, index) => [winner.tireModelId, index]));
  kits.sort((a, b) => {
    const rankDiff = (winnerOrder.get(a.tireModelId) ?? 0) - (winnerOrder.get(b.tireModelId) ?? 0);
    return rankDiff !== 0 ? rankDiff : a.packQuantity - b.packQuantity;
  });

  const tires = await Promise.all(kits.map((item) => tireRepository.findBySlug(item.slug)));
  return tires.filter((tire): tire is Tire => tire !== null);
}
