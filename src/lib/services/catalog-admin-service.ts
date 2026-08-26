import { prisma } from "@/lib/prisma";
import { toCharmPrice } from "@/lib/catalog/pricing";
import { TOP_TIRE_BRANDS } from "@/lib/catalog/top-brands";

// Camada de leitura para o painel /admin/catalogo: monta a árvore
// marca → medida → produtos (no máximo 2 por marca/medida, já garantido
// pela constraint do banco — aqui só refletimos o que existe).

export type AdminCatalogProduct = {
  id: string;
  name: string;
  tireModelName: string;
  rankingPosition: "FIRST" | "SECOND";
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  imageStatus: string;
  scoreOverall: string | null;
  isActive: boolean;
};

export type AdminCatalogSizeGroup = {
  sizeLabel: string;
  demandScore: string | null;
  brazilRelevance: string | null;
  minasGeraisRelevance: string | null;
  products: AdminCatalogProduct[];
};

export type AdminCatalogBrandGroup = {
  brandName: string;
  brandSlug: string;
  totalProducts: number;
  sizes: AdminCatalogSizeGroup[];
};

export async function getAdminCatalog(): Promise<AdminCatalogBrandGroup[]> {
  const brands = await prisma.brand.findMany({
    where: { products: { some: {} } },
    include: {
      products: {
        include: {
          tireModel: true,
          size: { include: { demand: true } },
          stock: true,
          score: true,
        },
        orderBy: [{ width: "asc" }, { aspectRatio: "asc" }, { rim: "asc" }, { rankingPosition: "asc" }],
      },
    },
  });

  // Ordena as marcas prioritárias (TOP_TIRE_BRANDS) primeiro, na ordem
  // decidida na pesquisa original; qualquer marca adicional que só existe em
  // segmentos pesquisados à parte (ex: Levorin/Rinaldi em moto, que não
  // vendem pneu de carro/SUV e por isso não entram em TOP_TIRE_BRANDS) vem
  // depois, em ordem alfabética.
  const byName = new Map(brands.map((brand) => [brand.name, brand]));
  const extraBrandNames = brands
    .map((brand) => brand.name)
    .filter((name) => !(TOP_TIRE_BRANDS as readonly string[]).includes(name))
    .sort((a, b) => a.localeCompare(b));
  const orderedBrandNames = [...TOP_TIRE_BRANDS, ...extraBrandNames];

  return orderedBrandNames.map((brandName) => {
    const brand = byName.get(brandName);
    if (!brand) {
      return { brandName, brandSlug: "", totalProducts: 0, sizes: [] };
    }

    const sizeGroups = new Map<string, AdminCatalogSizeGroup>();
    for (const product of brand.products) {
      const key =
        product.aspectRatio != null
          ? `${product.width}/${product.aspectRatio} R${product.rim}`
          : `${product.width} R${product.rim}`;
      if (!sizeGroups.has(key)) {
        sizeGroups.set(key, {
          sizeLabel: key,
          demandScore: product.size.demand?.demandScore ?? null,
          brazilRelevance: product.size.demand?.brazilRelevance ?? null,
          minasGeraisRelevance: product.size.demand?.minasGeraisRelevance ?? null,
          products: [],
        });
      }
      sizeGroups.get(key)!.products.push({
        id: product.id,
        name: product.name,
        tireModelName: product.tireModel.name,
        rankingPosition: product.rankingPosition,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : null,
        stockQuantity: product.stock?.quantity ?? 0,
        imageStatus: product.imageStatus,
        scoreOverall: product.score?.overall ?? null,
        isActive: product.isActive,
      });
    }

    return {
      brandName: brand.name,
      brandSlug: brand.slug,
      totalProducts: brand.products.length,
      sizes: [...sizeGroups.values()].sort((a, b) => a.sizeLabel.localeCompare(b.sizeLabel)),
    };
  });
}

// Escrita de preço/desconto (/admin/catalogo): o admin pode corrigir o preço
// pesquisado inicialmente e/ou colocar um preço "de/por" (compareAtPrice >
// price mostra o preço antigo cortado + o novo, no mesmo estilo já usado
// pelas ofertas geradas automaticamente no catálogo). Nunca é sobrescrito
// pelo reseed (ver prisma/seed.ts: update: {} no upsert de Product).
//
// Preço "cheio" (terminado em ,00) nunca é salvo — sempre convertido pra
// ,90 (toCharmPrice), padrão de varejo. Validação de compareAtPrice > price
// usa os valores originais (antes do arredondamento), pra não recusar um
// preço válido por causa do ajuste de centavos.
export async function updateProductPrice(
  productId: string,
  price: number,
  compareAtPrice: number | null,
): Promise<void> {
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("O preço precisa ser um número maior que zero.");
  }
  if (compareAtPrice != null && (!Number.isFinite(compareAtPrice) || compareAtPrice <= price)) {
    throw new Error("O preço antigo (\"de\") precisa ser maior que o preço atual.");
  }
  await prisma.product.update({
    where: { id: productId },
    data: {
      price: toCharmPrice(price),
      compareAtPrice: compareAtPrice != null ? toCharmPrice(compareAtPrice) : null,
    },
  });
}

// Desconto em massa: aplica `percent`% de desconto sobre o preço "original"
// de cada produto ativo — usando compareAtPrice como base quando já existe
// (pra reaplicar um percentual diferente não compor descontos em cima de
// descontos), senão o price atual. Reaplicar esta ação com outro percentual
// sempre recalcula a partir do mesmo preço original.
export async function applyBulkDiscount(percent: number): Promise<number> {
  if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
    throw new Error("O desconto precisa ser um percentual entre 0 e 100.");
  }
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, price: true, compareAtPrice: true },
  });

  await prisma.$transaction(
    products.map((product) => {
      const original = product.compareAtPrice != null ? Number(product.compareAtPrice) : Number(product.price);
      const discounted = toCharmPrice(original * (1 - percent / 100));
      return prisma.product.update({
        where: { id: product.id },
        data: { price: discounted, compareAtPrice: original },
      });
    }),
  );

  return products.length;
}

// Reverte o desconto em massa: restaura price = compareAtPrice e limpa
// compareAtPrice em todo produto que estiver com desconto ativo.
export async function clearAllDiscounts(): Promise<number> {
  const products = await prisma.product.findMany({
    where: { compareAtPrice: { not: null } },
    select: { id: true, compareAtPrice: true },
  });

  await prisma.$transaction(
    products.map((product) =>
      prisma.product.update({
        where: { id: product.id },
        data: { price: product.compareAtPrice!, compareAtPrice: null },
      }),
    ),
  );

  return products.length;
}

export async function getCatalogSummary() {
  const [totalProducts, pendingImages, brandCount] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { imageStatus: "PENDING_PERMISSION" } }),
    prisma.brand.count({ where: { products: { some: {} } } }),
  ]);
  return { totalProducts, pendingImages, brandCount };
}
