import { prisma } from "@/lib/prisma";

// Serviço de fotos por modelo (/admin/fotos-produtos): o admin escolhe uma
// marca e um modelo (ex: Bridgestone + Turanza) e anexa fotos uma única vez
// — elas são aplicadas a TODOS os produtos daquele par marca+modelo,
// independente da medida. A primeira foto (position 0) é a "capa" — a que
// aparece nos cards de produto, carrinho e mini-carrinho.

export type BrandOption = {
  id: string;
  name: string;
  slug: string;
};

export type ModelOption = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  images: string[];
};

export async function listBrandsWithModels(): Promise<
  { brand: BrandOption; models: ModelOption[] }[]
> {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      tireModels: {
        orderBy: { name: "asc" },
        include: {
          products: {
            select: {
              id: true,
              images: { select: { url: true }, orderBy: { position: "asc" } },
            },
            take: 1,
            where: { images: { some: {} } },
          },
          _count: { select: { products: true } },
        },
      },
    },
  });

  return brands.map((brand) => ({
    brand: { id: brand.id, name: brand.name, slug: brand.slug },
    models: brand.tireModels.map((model) => ({
      id: model.id,
      name: model.name,
      slug: model.slug,
      productCount: model._count.products,
      images: model.products[0]?.images.map((image) => image.url) ?? [],
    })),
  }));
}

export async function getModelPhotos(tireModelId: string): Promise<string[]> {
  const product = await prisma.product.findFirst({
    where: { tireModelId, images: { some: {} } },
    include: { images: { orderBy: { position: "asc" } } },
  });
  return product?.images.map((image) => image.url) ?? [];
}

// Grava o mesmo conjunto de fotos (na ordem dada) em todos os produtos do
// par marca+modelo — a posição 0 é sempre a capa. Não mexe em imageStatus:
// quem decide o status é o chamador (upload novo vs. só reordenar).
async function replaceModelImages(tireModelId: string, imageUrls: string[]): Promise<number> {
  const products = await prisma.product.findMany({
    where: { tireModelId },
    select: { id: true, name: true },
  });

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId: { in: products.map((p) => p.id) } } }),
    ...products.map((product) =>
      prisma.productImage.createMany({
        data: imageUrls.map((url, position) => ({
          productId: product.id,
          url,
          altText: product.name,
          position,
        })),
      }),
    ),
  ]);

  return products.length;
}

// Aplica um novo conjunto de fotos (upload) a todos os produtos do par
// marca+modelo, substituindo qualquer foto anterior. imageStatus vira OWN
// porque é o próprio lojista que está anexando a foto agora (não uma
// coleta do site do fabricante).
export async function applyModelPhotos(
  tireModelId: string,
  imageUrls: string[],
): Promise<{ updatedProducts: number }> {
  const updatedProducts = await replaceModelImages(tireModelId, imageUrls);
  await prisma.product.updateMany({
    where: { tireModelId },
    data: { imageStatus: imageUrls.length > 0 ? "OWN" : "PENDING_PERMISSION" },
  });
  return { updatedProducts };
}

// Reordena as fotos já existentes para que `coverUrl` vire a capa (posição
// 0), preservando a ordem relativa das demais. Não altera imageStatus — é
// só uma reordenação, não uma nova fonte de imagem.
export async function setCoverPhoto(
  tireModelId: string,
  coverUrl: string,
): Promise<{ updatedProducts: number }> {
  const currentUrls = await getModelPhotos(tireModelId);
  if (!currentUrls.includes(coverUrl)) {
    throw new Error("Essa foto não pertence a este modelo.");
  }

  const reordered = [coverUrl, ...currentUrls.filter((url) => url !== coverUrl)];
  const updatedProducts = await replaceModelImages(tireModelId, reordered);
  return { updatedProducts };
}
