import type { TireFacets } from "@/types/catalog";

import { FilterCheckboxLink } from "./filter-checkbox-link";
import { FilterSection } from "./filter-section";

export function FilterSidebar({ facets }: { facets: TireFacets }) {
  return (
    <div className="divide-border flex flex-col divide-y">
      <FilterSection title="Marca">
        {facets.brands.map((option) => (
          <FilterCheckboxLink key={option.value} {...option} />
        ))}
      </FilterSection>

      {facets.rimDiameters.length > 1 && (
        <FilterSection title="Aro">
          {facets.rimDiameters.map((option) => (
            <FilterCheckboxLink key={option.value} {...option} />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Preço">
        {facets.priceRanges.map((option) => (
          <FilterCheckboxLink key={option.value} {...option} />
        ))}
      </FilterSection>

      {facets.loadIndexes.length > 0 && (
        <FilterSection title="Índice de carga">
          {facets.loadIndexes.map((option) => (
            <FilterCheckboxLink key={option.value} {...option} />
          ))}
        </FilterSection>
      )}

      {facets.speedRatings.length > 0 && (
        <FilterSection title="Índice de velocidade">
          {facets.speedRatings.map((option) => (
            <FilterCheckboxLink key={option.value} {...option} />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Run flat">
        <FilterCheckboxLink
          href={facets.runFlat.href}
          label="Somente run flat"
          count={facets.runFlat.count}
          active={facets.runFlat.active}
        />
      </FilterSection>

      {facets.vehicleTypes.length > 0 && (
        <FilterSection title="Tipo de veículo">
          {facets.vehicleTypes.map((option) => (
            <FilterCheckboxLink key={option.value} {...option} />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Disponibilidade">
        {facets.availabilities.map((option) => (
          <FilterCheckboxLink key={option.value} {...option} />
        ))}
      </FilterSection>
    </div>
  );
}
