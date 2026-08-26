import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Pagination } from "@/components/catalog/pagination";
import { ProductList } from "@/components/catalog/product-list";
import { Container } from "@/components/ui/container";
import { listByBrandSlug } from "@/lib/services/catalog-listing-service";
import { prisma } from "@/lib/prisma";

type PageParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await prisma.brand.findUnique({ where: { slug } });
  if (!brand) return { title: "Marca não encontrada" };
  return {
    title: `Pneus ${brand.name}`,
    description: `Pneus ${brand.name} com entrega para todo o estado de Minas Gerais.`,
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const brand = await prisma.brand.findUnique({ where: { slug } });
  if (!brand) notFound();

  const page = Number(pageParam) || 1;
  const result = await listByBrandSlug(slug, page);

  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <div>
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
          Pneus {brand.name}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {result.total} produto{result.total === 1 ? "" : "s"} encontrado
          {result.total === 1 ? "" : "s"}.
        </p>
      </div>

      <ProductList
        products={result.tires}
        emptyTitle="Nenhum produto cadastrado ainda"
        emptyDescription="Estamos ampliando o catálogo desta marca."
      />

      <Pagination
        basePath={`/marcas/${slug}`}
        searchParams={new URLSearchParams()}
        page={result.page}
        totalPages={result.totalPages}
      />
    </Container>
  );
}
