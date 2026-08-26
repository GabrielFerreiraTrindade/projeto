import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Pagination } from "@/components/catalog/pagination";
import { ProductList } from "@/components/catalog/product-list";
import { Container } from "@/components/ui/container";
import { categoryNavLinks } from "@/lib/constants";
import { listByCategorySlug } from "@/lib/services/catalog-listing-service";
import { prisma } from "@/lib/prisma";

type PageParams = { slug: string };

function findNavLabel(slug: string): string | undefined {
  return categoryNavLinks.find((link) => link.href === `/categoria/${slug}`)?.label;
}

function isComingSoon(slug: string): boolean {
  return (
    categoryNavLinks.find((link) => link.href === `/categoria/${slug}`)?.comingSoon ?? false
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = findNavLabel(slug);
  if (!label) return { title: "Categoria não encontrada" };
  return { title: `Pneus — ${label}` };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const label = findNavLabel(slug);
  if (!label) notFound();

  if (isComingSoon(slug)) {
    return (
      <Container className="flex flex-col items-center gap-3 py-20 text-center">
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">{label}</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Ainda não temos pneus cadastrados para este segmento. Estamos
          ampliando o catálogo — volte em breve.
        </p>
      </Container>
    );
  }

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const page = Number(pageParam) || 1;
  const result = await listByCategorySlug(slug, page);

  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <div>
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">{label}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {result.total} produto{result.total === 1 ? "" : "s"} encontrado
          {result.total === 1 ? "" : "s"}.
        </p>
      </div>

      <ProductList
        products={result.tires}
        emptyTitle="Nenhum produto cadastrado ainda"
        emptyDescription="Estamos ampliando o catálogo deste segmento."
      />

      <Pagination
        basePath={`/categoria/${slug}`}
        searchParams={new URLSearchParams()}
        page={result.page}
        totalPages={result.totalPages}
      />
    </Container>
  );
}
