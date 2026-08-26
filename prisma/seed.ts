import bcrypt from "bcryptjs";

import { generateAgroCatalog } from "../src/lib/catalog/agro-generator";
import { generateCatalog, assertMaxTwoModelsPerBrandPerSize } from "../src/lib/catalog/catalog-generator";
import { generateKitCatalog, kitImagePath } from "../src/lib/catalog/kit-generator";
import { MODEL_IMAGES } from "../src/lib/catalog/model-images";
import { generateMotoCatalog } from "../src/lib/catalog/moto-generator";
import { generateTruckCatalog } from "../src/lib/catalog/truck-generator";
import { generateVanCatalog } from "../src/lib/catalog/van-generator";
import { TIRE_SIZE_DEMAND_SEED } from "../src/lib/catalog/tire-size-demand-data";
import { TOP_TIRE_BRANDS } from "../src/lib/catalog/top-brands";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_ID,
  DEMO_USER_PASSWORD,
} from "../src/lib/data/demo-account";
import { prisma } from "../src/lib/prisma";

// Popula o Postgres com o catálogo inicial de importação (10 marcas
// prioritárias, no máximo 2 modelos por marca por medida — ver
// src/lib/catalog/) e uma conta de demonstração com endereço e histórico de
// pedidos. Idempotente: pode rodar várias vezes (usa upsert).
// Rodar com: npm run db:seed

const CATEGORIES = [
  { slug: "carro", name: "Pneus de carro" },
  { slug: "suv-caminhonete", name: "Pneus de SUV e caminhonete" },
  { slug: "moto", name: "Pneus de moto" },
  { slug: "van-e-utilitario", name: "Pneus de van e utilitário" },
  { slug: "caminhao-e-onibus", name: "Pneus de caminhão e ônibus" },
  { slug: "agricola-e-otr", name: "Pneus agrícolas e OTR" },
  { slug: "kit-de-pneus", name: "Kit de Pneus" },
] as const;

function slugifyBrand(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const IMAGES_BY_MODEL = new Map(
  MODEL_IMAGES.map((entry) => [`${entry.brandName}__${entry.tireModelSlug}`, entry]),
);

async function seedCatalog() {
  const carProducts = generateCatalog();
  assertMaxTwoModelsPerBrandPerSize(carProducts);
  const motoProducts = generateMotoCatalog();
  const vanProducts = generateVanCatalog();
  const truckProducts = generateTruckCatalog();
  const agroProducts = generateAgroCatalog();
  const kitProducts = generateKitCatalog();
  const products = [
    ...carProducts,
    ...motoProducts,
    ...vanProducts,
    ...truckProducts,
    ...agroProducts,
    ...kitProducts,
  ];

  // Marcas prioritárias (TOP_TIRE_BRANDS, escopo do catálogo carro/SUV +
  // importação manual) mais qualquer marca adicional que só existe em
  // segmentos novos pesquisados à parte (ex: Levorin/Rinaldi em moto) — essas
  // não entram em TOP_TIRE_BRANDS porque não vendem pneu de carro/SUV no
  // Brasil, então mudar essa lista pra incluí-las forçaria a inventar uma
  // linha de carro pra elas.
  const brandNames = new Set<string>([...TOP_TIRE_BRANDS, ...products.map((item) => item.brandName)]);
  const brandIds = new Map<string, string>();
  for (const name of brandNames) {
    const brand = await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugifyBrand(name) },
    });
    brandIds.set(name, brand.id);
  }

  const categoryIds = new Map<string, string>();
  for (const category of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    categoryIds.set(category.slug, row.id);
  }

  const tireModelIds = new Map<string, string>();
  for (const product of products) {
    const key = `${product.brandName}__${product.tireModelSlug}`;
    if (tireModelIds.has(key)) continue;
    const tireModel = await prisma.tireModel.upsert({
      where: {
        brandId_slug: {
          brandId: brandIds.get(product.brandName)!,
          slug: product.tireModelSlug,
        },
      },
      update: {},
      create: {
        brandId: brandIds.get(product.brandName)!,
        name: product.tireModelName,
        slug: product.tireModelSlug,
      },
    });
    tireModelIds.set(key, tireModel.id);
  }

  // Uma linha por combinação única de medida (largura+perfil+aro) — cobre
  // tanto as medidas de carro/SUV pesquisadas (TIRE_SIZE_DEMAND_SEED) quanto
  // as de moto (que não têm pesquisa de demanda/relevância por região
  // ainda, só o TireSize em si).
  const sizeIds = new Map<string, string>();
  const seenSizeKeys = new Set<string>();
  for (const item of products) {
    const key = `${item.width}-${item.aspectRatio}-${item.rim}`;
    if (seenSizeKeys.has(key)) continue;
    seenSizeKeys.add(key);

    // A constraint única composta não funciona quando aspectRatio é null
    // (pneus comerciais tipo "185 R14" sem perfil) — SQL trata NULL como
    // nunca igual a si mesmo em índices únicos. Nesse caso, busca manual em
    // vez de upsert pela chave composta.
    let size;
    if (item.aspectRatio != null) {
      size = await prisma.tireSize.upsert({
        where: {
          width_aspectRatio_rimDiameter_loadIndex_speedRating: {
            width: item.width,
            aspectRatio: item.aspectRatio,
            rimDiameter: item.rim,
            loadIndex: item.loadIndex,
            speedRating: item.speedIndex,
          },
        },
        update: {},
        create: {
          width: item.width,
          aspectRatio: item.aspectRatio,
          rimDiameter: item.rim,
          loadIndex: item.loadIndex,
          speedRating: item.speedIndex,
        },
      });
    } else {
      size =
        (await prisma.tireSize.findFirst({
          where: {
            width: item.width,
            aspectRatio: null,
            rimDiameter: item.rim,
            loadIndex: item.loadIndex,
            speedRating: item.speedIndex,
          },
        })) ??
        (await prisma.tireSize.create({
          data: {
            width: item.width,
            aspectRatio: null,
            rimDiameter: item.rim,
            loadIndex: item.loadIndex,
            speedRating: item.speedIndex,
          },
        }));
    }
    sizeIds.set(key, size.id);

    const sizeSeed = TIRE_SIZE_DEMAND_SEED.find(
      (seed) => seed.width === item.width && seed.aspectRatio === item.aspectRatio && seed.rim === item.rim,
    );
    if (!sizeSeed) continue;

    await prisma.tireSizeDemand.upsert({
      where: { tireSizeId: size.id },
      update: {
        demandScore: sizeSeed.demandScore,
        brazilRelevance: sizeSeed.brazilRelevance,
        minasGeraisRelevance: sizeSeed.minasGeraisRelevance,
        sources: sizeSeed.sources,
      },
      create: {
        tireSizeId: size.id,
        width: sizeSeed.width,
        aspectRatio: sizeSeed.aspectRatio,
        rim: sizeSeed.rim,
        demandScore: sizeSeed.demandScore,
        brazilRelevance: sizeSeed.brazilRelevance,
        minasGeraisRelevance: sizeSeed.minasGeraisRelevance,
        sources: sizeSeed.sources,
      },
    });
  }

  const productIdBySlug = new Map<string, string>();
  for (const item of products) {
    const sizeKey = `${item.width}-${item.aspectRatio}-${item.rim}`;
    const brandId = brandIds.get(item.brandName)!;
    const sizeId = sizeIds.get(sizeKey)!;
    const tireModelId = tireModelIds.get(`${item.brandName}__${item.tireModelSlug}`)!;
    const categoryId = categoryIds.get(item.categorySlug)!;
    // Kit (packQuantity > 1) usa a foto composta localmente (mesma foto do
    // produto avulso, N unidades lado a lado — ver kit-generator.ts), não a
    // curadoria de MODEL_IMAGES. imageStatus "OWN" porque é uma imagem
    // derivada que geramos, não a foto oficial do fabricante em si.
    const isKit = item.packQuantity > 1;
    const modelImages = IMAGES_BY_MODEL.get(`${item.brandName}__${item.tireModelSlug}`);
    const imageSet = isKit
      ? { sourceUrl: item.sourceUrl, images: [kitImagePath(item.brandName, item.tireModelSlug, item.packQuantity)] }
      : modelImages;
    const imageStatus = isKit ? "OWN" : modelImages ? "MANUFACTURER_AUTHORIZED" : item.imageStatus;

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      // Em update, NUNCA mexe em price/compareAtPrice nem no imageStatus de
      // produtos sem MODEL_IMAGES/kit (o admin pode ter anexado foto própria
      // pelo /admin/fotos-produtos — reseed não pode reverter isso). Mas
      // quando este seed TEM um conjunto de fotos curado (imageSet), ele é
      // reaplicado e o imageStatus é corrigido pra refletir isso — cobre o
      // caso de um modelo que ganhou fotos numa rodada de coleta posterior
      // à criação do produto no banco.
      update: imageSet ? { imageStatus } : {},
      create: {
        id: item.sku,
        sku: item.sku,
        name: item.name,
        slug: item.slug,
        description: item.description,
        brandId,
        tireModelId,
        categoryId,
        sizeId,
        width: item.width,
        aspectRatio: item.aspectRatio,
        rim: item.rim,
        loadIndex: item.loadIndex,
        speedIndex: item.speedIndex,
        runFlat: item.runFlat,
        vehicleType: item.vehicleType,
        rankingPosition: item.rankingPosition,
        packQuantity: item.packQuantity,
        imageStatus,
        source: item.source,
        sourceUrl: item.sourceUrl,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
      },
    });
    productIdBySlug.set(item.slug, product.id);

    await prisma.stockItem.upsert({
      where: { productId: product.id },
      update: {},
      create: { productId: product.id, quantity: item.stockQuantity },
    });

    // Só mexe nas fotos quando temos um conjunto curado nosso
    // (MODEL_IMAGES). Para modelos sem entrada ali (ex: Bridgestone, cujas
    // fotos foram bloqueadas na coleta), o admin pode ter anexado fotos
    // próprias depois pelo /admin/fotos-produtos — reseed nunca pode apagar
    // isso.
    if (imageSet) {
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.createMany({
        data: imageSet.images.map((url, position) => ({
          productId: product.id,
          url,
          altText: item.name,
          position,
        })),
      });
    }

    await prisma.productSource.deleteMany({ where: { productId: product.id } });
    await prisma.productSource.create({
      data: {
        productId: product.id,
        sourceType: "MANUFACTURER",
        sourceName: `${item.brandName} — catálogo oficial`,
        note: item.sourceEvidence,
      },
    });
    if (imageSet) {
      await prisma.productSource.create({
        data: {
          productId: product.id,
          sourceType: "MANUFACTURER",
          sourceName: isKit
            ? `${item.brandName} — imagem do kit composta a partir da foto do produto avulso`
            : `${item.brandName} — fotos oficiais do produto`,
          url: imageSet.sourceUrl,
          note: isKit
            ? `Imagem gerada localmente (${item.packQuantity} unidades da mesma foto lado a lado) a partir da foto já autorizada do produto avulso desta marca/modelo/medida.`
            : "Cliente (dono da loja) declarou ser parceiro/revendedor autorizado desta marca, com permissão de usar as fotos publicadas pelo fabricante para fins de venda do produto. Mesmo conjunto de fotos aplicado a todas as medidas deste modelo.",
        },
      });
    }

    await prisma.productScore.upsert({
      where: { productId: product.id },
      update: item.score,
      create: { productId: product.id, ...item.score },
    });
  }

  // Remove produtos que existiam de uma geração anterior mas não fazem mais
  // parte do catálogo atual — normalmente porque a faixa de aro real de um
  // modelo (BRAND_MODEL_LINES) foi corrigida e algumas medidas deixaram de
  // ser válidas para aquele modelo (ex: uma linha de carro popular não é
  // fabricada em aro 20+). Só afeta produtos dos modelos que este seed
  // gerencia (tireModelId em tireModelIds) — nunca produtos importados
  // manualmente pelo admin com outro modelo.
  const validSlugs = new Set(products.map((item) => item.slug));
  const orphaned = await prisma.product.findMany({
    where: {
      tireModelId: { in: [...tireModelIds.values()] },
      slug: { notIn: [...validSlugs] },
    },
    select: { id: true, slug: true },
  });

  let removedCount = 0;
  for (const product of orphaned) {
    try {
      await prisma.$transaction([
        prisma.productScore.deleteMany({ where: { productId: product.id } }),
        prisma.productSource.deleteMany({ where: { productId: product.id } }),
        prisma.productImage.deleteMany({ where: { productId: product.id } }),
        prisma.stockItem.deleteMany({ where: { productId: product.id } }),
        prisma.cartItem.deleteMany({ where: { productId: product.id } }),
        prisma.review.deleteMany({ where: { productId: product.id } }),
        prisma.product.delete({ where: { id: product.id } }),
      ]);
      removedCount += 1;
    } catch (error) {
      console.warn(
        `Não foi possível remover o produto órfão ${product.slug} (provavelmente referenciado por um pedido real):`,
        error instanceof Error ? error.message : error,
      );
    }
  }
  if (orphaned.length > 0) {
    console.log(
      `Removidos ${removedCount} de ${orphaned.length} produtos que não existem de verdade nessa medida para o modelo (fora da faixa de aro real da linha).`,
    );
  }

  console.log(
    `Catálogo semeado: ${products.length} produtos (${carProducts.length} carro/SUV em ${TIRE_SIZE_DEMAND_SEED.length} medidas + ${motoProducts.length} moto + ${vanProducts.length} van + ${truckProducts.length} caminhão/ônibus + ${agroProducts.length} agrícola/OTR + ${kitProducts.length} kit de pneus).`,
  );
  return productIdBySlug;
}

async function seedDemoAccount(productIdBySlug: Map<string, string>) {
  const passwordHash = bcrypt.hashSync(DEMO_USER_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      name: "Usuária Demonstração",
      email: DEMO_USER_EMAIL,
      cpf: "52998224725",
      phone: "31998887766",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  // Avaliação 5 estrelas em todo produto ativo, pra nenhum card ficar com
  // estrela vazia (0 de 5) — id determinístico por produto, então rodar o
  // seed de novo não duplica review nem sobrescreve uma avaliação real que
  // um cliente venha a escrever depois pela loja.
  const reviewComments = [
    "Ótimo pneu, recomendo!",
    "Excelente custo-benefício, entrega rápida.",
    "Pneu de qualidade, exatamente como descrito.",
    "Muito satisfeito com a compra.",
    "Superou minhas expectativas.",
  ];
  let reviewIndex = 0;
  for (const productId of productIdBySlug.values()) {
    await prisma.review.upsert({
      where: { id: `review-seed-${productId}` },
      update: {},
      create: {
        id: `review-seed-${productId}`,
        productId,
        userId: DEMO_USER_ID,
        rating: 5,
        comment: reviewComments[reviewIndex % reviewComments.length],
      },
    });
    reviewIndex += 1;
  }

  const address = await prisma.address.upsert({
    where: { id: "demo-address-1" },
    update: {},
    create: {
      id: "demo-address-1",
      userId: user.id,
      label: "Casa",
      recipient: "Usuária Demonstração",
      street: "Rua das Acácias",
      number: "120",
      complement: "Apto 302",
      neighborhood: "Savassi",
      city: "Belo Horizonte",
      state: "MG",
      zipCode: "30130010",
      isDefault: true,
    },
  });

  // Pedidos históricos de exemplo, já concluídos, para a tela "Meus
  // pedidos" ter conteúdo para mostrar. Os slugs abaixo correspondem a
  // produtos reais do catálogo gerado (ver src/lib/catalog/catalog-generator.ts).
  const demoOrderSeeds = [
    {
      id: "demo-order-1",
      orderNumber: "PM-DEMO01",
      status: "DELIVERED" as const,
      paymentStatus: "PAID" as const,
      paymentMethod: "PIX" as const,
      createdAt: new Date("2026-06-15"),
      slug: "michelin-primacy-4-185-65-r15",
      quantity: 2,
      unitPrice: 435,
    },
    {
      id: "demo-order-2",
      orderNumber: "PM-DEMO02",
      status: "SHIPPED" as const,
      paymentStatus: "PAID" as const,
      paymentMethod: "CREDIT_CARD" as const,
      createdAt: new Date("2026-07-22"),
      slug: "pirelli-scorpion-verde-225-65-r17",
      quantity: 4,
      unitPrice: 715,
    },
    {
      id: "demo-order-3",
      orderNumber: "PM-DEMO03",
      status: "PROCESSING" as const,
      paymentStatus: "PAID" as const,
      paymentMethod: "PIX" as const,
      createdAt: new Date("2026-08-18"),
      slug: "firestone-f-600-175-70-r14",
      quantity: 1,
      unitPrice: 400,
    },
  ];

  for (const seed of demoOrderSeeds) {
    const productId = productIdBySlug.get(seed.slug);
    if (!productId) {
      console.warn(`Produto ${seed.slug} não encontrado para o pedido demo ${seed.id} — pulando.`);
      continue;
    }

    const subtotal = seed.unitPrice * seed.quantity;
    const shippingCost = seed.id === "demo-order-3" ? 19.9 : 0;
    const total = subtotal + shippingCost;

    await prisma.order.upsert({
      where: { id: seed.id },
      update: {},
      create: {
        id: seed.id,
        orderNumber: seed.orderNumber,
        userId: user.id,
        addressId: address.id,
        status: seed.status,
        subtotal,
        shippingCost,
        discount: 0,
        total,
        createdAt: seed.createdAt,
        items: {
          create: [{ productId, quantity: seed.quantity, unitPrice: seed.unitPrice }],
        },
        payment: {
          create: {
            method: seed.paymentMethod,
            status: seed.paymentStatus,
            amount: total,
            gateway: "pagarme",
            externalId: `demo_${seed.id}`,
          },
        },
        shipment: {
          create: {
            method: "PAC",
            carrier: "Correios",
            price: shippingCost,
            status: seed.status === "DELIVERED" ? "DELIVERED" : "IN_TRANSIT",
          },
        },
      },
    });
  }

  console.log(`Conta de demonstração semeada: ${DEMO_USER_EMAIL}`);
}

async function main() {
  const productIdBySlug = await seedCatalog();
  await seedDemoAccount(productIdBySlug);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
