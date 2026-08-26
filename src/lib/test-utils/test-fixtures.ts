import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";
import type { Tire } from "@/types/catalog";

// Pneu de mentira para testes de cálculo do carrinho (não toca no banco).
export function makeTestTire(overrides: Partial<Tire> = {}): Tire {
  return {
    id: "test-tire-1",
    slug: "test-tire-1",
    name: "Pneu de Teste",
    brand: "Marca de Teste",
    model: "Modelo de Teste",
    description: "Pneu de teste.",
    size: "185/65 R15",
    category: "carro",
    price: 100,
    rating: 4.5,
    reviewCount: 10,
    width: 185,
    aspectRatio: 65,
    rimDiameter: 15,
    loadIndex: "88",
    speedRating: "H",
    runFlat: false,
    availability: "in_stock",
    ...overrides,
  };
}

// Helpers para criar/limpar dados de teste no Postgres real (mesmo banco de
// dev). Cada teste cria seus próprios registros com ids únicos e os remove
// no final — nunca toca nos dados semeados (produtos do catálogo, conta de
// demonstração).

export async function createTestUser() {
  const id = `test-user-${crypto.randomUUID()}`;
  return prisma.user.create({
    data: {
      id,
      name: "Cliente de Teste",
      email: `${id}@example.com`,
      cpf: crypto.randomInt(10000000000, 99999999999).toString(),
      phone: "31999999999",
      passwordHash: "test-hash",
      role: "CUSTOMER",
    },
  });
}

export async function createTestAddress(userId: string) {
  return prisma.address.create({
    data: {
      id: `test-address-${crypto.randomUUID()}`,
      userId,
      recipient: "Cliente de Teste",
      street: "Rua de Teste",
      number: "100",
      neighborhood: "Centro",
      city: "Belo Horizonte",
      state: "MG",
      zipCode: "30130010",
      isDefault: true,
    },
  });
}

export async function createTestProduct(options?: {
  price?: number;
  stockQuantity?: number;
}) {
  const id = `test-product-${crypto.randomUUID()}`;

  // Marca e modelo próprios por produto (em vez de compartilhados entre
  // testes): a constraint @@unique([brandId, sizeId, rankingPosition]) do
  // catálogo permite no máximo 2 produtos por marca+medida, e vários testes
  // criam vários produtos de teste na mesma medida (185/65 R15) dentro do
  // mesmo describe — usar uma marca isolada por produto evita colidir com
  // essa regra sem precisar coordenar rankingPosition entre os testes.
  const brand = await prisma.brand.create({
    data: { name: `Marca de Teste ${id}`, slug: `marca-de-teste-${id}` },
  });
  const tireModel = await prisma.tireModel.create({
    data: { brandId: brand.id, name: "Modelo de Teste", slug: "modelo-de-teste" },
  });
  const category = await prisma.category.upsert({
    where: { slug: "categoria-de-teste" },
    update: {},
    create: { slug: "categoria-de-teste", name: "Categoria de Teste" },
  });
  const size = await prisma.tireSize.upsert({
    where: {
      width_aspectRatio_rimDiameter_loadIndex_speedRating: {
        width: 185,
        aspectRatio: 65,
        rimDiameter: 15,
        loadIndex: "88",
        speedRating: "H",
      },
    },
    update: {},
    create: { width: 185, aspectRatio: 65, rimDiameter: 15, loadIndex: "88", speedRating: "H" },
  });

  const product = await prisma.product.create({
    data: {
      id,
      sku: id,
      name: "Pneu de Teste",
      slug: id,
      brandId: brand.id,
      tireModelId: tireModel.id,
      categoryId: category.id,
      sizeId: size.id,
      width: 185,
      aspectRatio: 65,
      rim: 15,
      rankingPosition: "FIRST",
      price: options?.price ?? 100,
      isActive: true,
      stock: { create: { quantity: options?.stockQuantity ?? 10 } },
    },
  });

  return product;
}

export async function cleanupTestData(prefix: string) {
  await prisma.paymentEvent.deleteMany({
    where: { payment: { order: { user: { id: { startsWith: prefix } } } } },
  });
  await prisma.payment.deleteMany({ where: { order: { user: { id: { startsWith: prefix } } } } });
  await prisma.shipment.deleteMany({ where: { order: { user: { id: { startsWith: prefix } } } } });
  await prisma.orderItem.deleteMany({ where: { order: { user: { id: { startsWith: prefix } } } } });
  await prisma.order.deleteMany({ where: { user: { id: { startsWith: prefix } } } });
  await prisma.address.deleteMany({ where: { userId: { startsWith: prefix } } });
  await prisma.user.deleteMany({ where: { id: { startsWith: prefix } } });
}

export async function cleanupTestProducts(prefix: string) {
  const products = await prisma.product.findMany({
    where: { id: { startsWith: prefix } },
    select: { id: true, brandId: true, tireModelId: true },
  });
  const productIds = products.map((product) => product.id);
  const tireModelIds = products.map((product) => product.tireModelId);
  const brandIds = products.map((product) => product.brandId);

  await prisma.productScore.deleteMany({ where: { productId: { in: productIds } } });
  await prisma.productSource.deleteMany({ where: { productId: { in: productIds } } });
  await prisma.stockItem.deleteMany({ where: { productId: { startsWith: prefix } } });
  await prisma.product.deleteMany({ where: { id: { startsWith: prefix } } });
  await prisma.tireModel.deleteMany({ where: { id: { in: tireModelIds } } });
  await prisma.brand.deleteMany({ where: { id: { in: brandIds } } });
}
