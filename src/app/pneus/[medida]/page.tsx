import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { Pagination } from "@/components/catalog/pagination";
import { ProductList } from "@/components/catalog/product-list";
import { SortSelect } from "@/components/catalog/sort-select";
import { Container } from "@/components/ui/container";
import { toURLSearchParams } from "@/lib/catalog/query";
import { formatSizeLabel, parseSizeSlug } from "@/lib/catalog/size-slug";
import {
  SORT_OPTIONS,
  searchTiresBySize,
} from "@/lib/services/tire-search-service";

type PageParams = { medida: string };
type PageSearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { medida } = await params;
  const size = parseSizeSlug(medida);

  if (!size) {
    return { title: "Medida não encontrada" };
  }

  const sizeLabel = formatSizeLabel(size);
  return {
    title: `Pneus ${sizeLabel}`,
    description: `Compre pneus na medida ${sizeLabel} com entrega para todo o estado de Minas Gerais.`,
  };
}

export default async function TireSizePage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<PageSearchParams>;
}) {
  const [{ medida }, rawSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const size = parseSizeSlug(medida);
  if (!size) {
    notFound();
  }

  const urlSearchParams = toURLSearchParams(rawSearchParams);
  const result = await searchTiresBySize(size, urlSearchParams);

  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <CatalogHeader sizeLabel={result.sizeLabel} total={result.total} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <CatalogFilters facets={result.facets} />

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              Página {result.page} de {result.totalPages}
            </p>
            <SortSelect current={result.sort} options={SORT_OPTIONS} />
          </div>

          <ProductList products={result.tires} />

          <Pagination
            basePath={`/pneus/${medida}`}
            searchParams={urlSearchParams}
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </div>
    </Container>
  );
}
