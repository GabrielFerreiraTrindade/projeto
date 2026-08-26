import { SlidersHorizontal } from "lucide-react";

import type { TireFacets } from "@/types/catalog";

import { FilterSidebar } from "./filter-sidebar";

// Filtros sempre visíveis em telas grandes; em telas pequenas viram um
// painel recolhível (<details>), sem depender de JavaScript.
export function CatalogFilters({ facets }: { facets: TireFacets }) {
  return (
    <>
      <details className="border-border rounded-xl border p-4 lg:hidden">
        <summary className="text-foreground flex cursor-pointer list-none items-center gap-2 text-sm font-semibold marker:content-none">
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filtros
        </summary>
        <div className="mt-4">
          <FilterSidebar facets={facets} />
        </div>
      </details>

      <aside className="border-border hidden rounded-xl border p-4 lg:block">
        <h2 className="text-foreground mb-2 flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filtros
        </h2>
        <FilterSidebar facets={facets} />
      </aside>
    </>
  );
}
