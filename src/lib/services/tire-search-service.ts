import { setSingleParamHref, toggleParamHref } from "@/lib/catalog/query";
import { formatSizeLabel, formatSizeSlug } from "@/lib/catalog/size-slug";
import { TOP_TIRE_BRANDS } from "@/lib/catalog/top-brands";
import { CATEGORY_LABELS } from "@/lib/constants";
import { tireRepository } from "@/lib/repositories/tire-repository";
import type {
  Availability,
  FacetOption,
  PriceRangeId,
  ProductCategory,
  SortOption,
  Tire,
  TireFacets,
  TireFilters,
  TireSearchResult,
  TireSize,
} from "@/types/catalog";

// Camada de serviço: orquestra o repositório, aplica filtros/ordenação/
// paginação e monta as facetas exibidas nos filtros. Não sabe nada sobre
// React nem sobre como os dados são efetivamente armazenados.

export const PAGE_SIZE = 8;

export const BRAND_FILTERS = TOP_TIRE_BRANDS;

const OTHER_BRANDS_VALUE = "outras";

const PRICE_RANGES: {
  id: PriceRangeId;
  label: string;
  min: number;
  max: number | null;
}[] = [
  { id: "ate-300", label: "Até R$ 300", min: 0, max: 300 },
  { id: "300-500", label: "R$ 300 – R$ 500", min: 300, max: 500 },
  { id: "500-800", label: "R$ 500 – R$ 800", min: 500, max: 800 },
  { id: "acima-800", label: "Acima de R$ 800", min: 800, max: null },
];

const VEHICLE_TYPE_LABELS: Record<ProductCategory, string> = CATEGORY_LABELS;

const AVAILABILITY_LABELS: Record<Availability, string> = {
  in_stock: "Em estoque",
  low_stock: "Últimas unidades",
  out_of_stock: "Sem estoque",
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevancia", label: "Relevância" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "mais-vendidos", label: "Mais vendidos" },
  { value: "melhor-avaliados", label: "Melhor avaliados" },
];

const SORT_VALUES = SORT_OPTIONS.map((option) => option.value);

function matchesBrandFilter(brand: string, filterValue: string): boolean {
  if (filterValue === OTHER_BRANDS_VALUE) {
    return !BRAND_FILTERS.includes(brand as (typeof BRAND_FILTERS)[number]);
  }
  return brand === filterValue;
}

function matchesPriceRange(price: number, id: PriceRangeId): boolean {
  const range = PRICE_RANGES.find((item) => item.id === id);
  if (!range) return false;
  const withinMin = price > range.min || range.min === 0;
  const withinMax = range.max === null || price <= range.max;
  return withinMin && withinMax;
}

export function parseTireFilters(searchParams: URLSearchParams): TireFilters {
  const sortParam = searchParams.get("ordenar") as SortOption | null;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  return {
    brands: searchParams.getAll("marca"),
    rimDiameters: [],
    priceRanges: searchParams.getAll("preco") as PriceRangeId[],
    loadIndexes: searchParams.getAll("carga"),
    speedRatings: searchParams.getAll("velocidade"),
    vehicleTypes: searchParams.getAll("veiculo") as ProductCategory[],
    availabilities: searchParams.getAll("disponibilidade") as Availability[],
    runFlatOnly: searchParams.get("runflat") === "1",
    sort:
      sortParam && SORT_VALUES.includes(sortParam) ? sortParam : "relevancia",
    page,
  };
}

function matchesFilters(tire: Tire, filters: TireFilters): boolean {
  if (
    filters.brands.length &&
    !filters.brands.some((brand) => matchesBrandFilter(tire.brand, brand))
  ) {
    return false;
  }
  if (
    filters.priceRanges.length &&
    !filters.priceRanges.some((id) => matchesPriceRange(tire.price, id))
  ) {
    return false;
  }
  if (
    filters.loadIndexes.length &&
    !filters.loadIndexes.includes(tire.loadIndex)
  ) {
    return false;
  }
  if (
    filters.speedRatings.length &&
    !filters.speedRatings.includes(tire.speedRating)
  ) {
    return false;
  }
  if (
    filters.vehicleTypes.length &&
    !filters.vehicleTypes.includes(tire.category)
  ) {
    return false;
  }
  if (
    filters.availabilities.length &&
    !filters.availabilities.includes(tire.availability)
  ) {
    return false;
  }
  if (filters.runFlatOnly && !tire.runFlat) {
    return false;
  }
  return true;
}

function sortTires(tires: Tire[], sort: SortOption): Tire[] {
  const sorted = [...tires];
  switch (sort) {
    case "menor-preco":
      return sorted.sort((a, b) => a.price - b.price);
    case "maior-preco":
      return sorted.sort((a, b) => b.price - a.price);
    case "mais-vendidos":
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    case "melhor-avaliados":
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted;
  }
}

function buildFacets(
  basePath: string,
  searchParams: URLSearchParams,
  sameRimTires: Tire[],
  sameProfileTires: Tire[],
  filters: TireFilters,
  currentSize: TireSize,
): TireFacets {
  const brands: FacetOption[] = [
    ...BRAND_FILTERS.map((brand) => ({ value: brand, label: brand })),
    { value: OTHER_BRANDS_VALUE, label: "Outras" },
  ]
    .map(({ value, label }) => ({
      value,
      label,
      count: sameRimTires.filter((tire) =>
        matchesBrandFilter(tire.brand, value),
      ).length,
      active: filters.brands.includes(value),
      href: toggleParamHref(basePath, searchParams, "marca", value),
    }))
    .filter((option) => option.count > 0 || option.active);

  const rimDiameters: FacetOption<number>[] = Array.from(
    new Set(sameProfileTires.map((tire) => tire.rimDiameter)),
  )
    .sort((a, b) => a - b)
    .map((rimDiameter) => {
      const path = `/pneus/${formatSizeSlug({ ...currentSize, rimDiameter })}`;
      const query = searchParams.toString();
      return {
        value: rimDiameter,
        label: `Aro ${rimDiameter}`,
        count: sameProfileTires.filter(
          (tire) => tire.rimDiameter === rimDiameter,
        ).length,
        active: rimDiameter === currentSize.rimDiameter,
        href: query ? `${path}?${query}` : path,
      };
    });

  const priceRanges: FacetOption<PriceRangeId>[] = PRICE_RANGES.map(
    (range) => ({
      value: range.id,
      label: range.label,
      count: sameRimTires.filter((tire) =>
        matchesPriceRange(tire.price, range.id),
      ).length,
      active: filters.priceRanges.includes(range.id),
      href: setSingleParamHref(basePath, searchParams, "preco", range.id),
    }),
  ).filter((option) => option.count > 0 || option.active);

  const loadIndexes: FacetOption[] = Array.from(
    new Set(sameRimTires.map((tire) => tire.loadIndex)),
  )
    .sort()
    .map((loadIndex) => ({
      value: loadIndex,
      label: loadIndex,
      count: sameRimTires.filter((tire) => tire.loadIndex === loadIndex).length,
      active: filters.loadIndexes.includes(loadIndex),
      href: toggleParamHref(basePath, searchParams, "carga", loadIndex),
    }));

  const speedRatings: FacetOption[] = Array.from(
    new Set(sameRimTires.map((tire) => tire.speedRating)),
  )
    .sort()
    .map((speedRating) => ({
      value: speedRating,
      label: speedRating,
      count: sameRimTires.filter((tire) => tire.speedRating === speedRating)
        .length,
      active: filters.speedRatings.includes(speedRating),
      href: toggleParamHref(basePath, searchParams, "velocidade", speedRating),
    }));

  const vehicleTypes: FacetOption<ProductCategory>[] = Array.from(
    new Set(sameRimTires.map((tire) => tire.category)),
  ).map((category) => ({
    value: category,
    label: VEHICLE_TYPE_LABELS[category],
    count: sameRimTires.filter((tire) => tire.category === category).length,
    active: filters.vehicleTypes.includes(category),
    href: toggleParamHref(basePath, searchParams, "veiculo", category),
  }));

  const availabilities: FacetOption<Availability>[] = (
    Object.keys(AVAILABILITY_LABELS) as Availability[]
  )
    .map((availability) => ({
      value: availability,
      label: AVAILABILITY_LABELS[availability],
      count: sameRimTires.filter((tire) => tire.availability === availability)
        .length,
      active: filters.availabilities.includes(availability),
      href: toggleParamHref(
        basePath,
        searchParams,
        "disponibilidade",
        availability,
      ),
    }))
    .filter((option) => option.count > 0 || option.active);

  const runFlatCount = sameRimTires.filter((tire) => tire.runFlat).length;

  return {
    brands,
    rimDiameters,
    priceRanges,
    loadIndexes,
    speedRatings,
    vehicleTypes,
    availabilities,
    runFlat: {
      active: filters.runFlatOnly,
      count: runFlatCount,
      href: setSingleParamHref(basePath, searchParams, "runflat", "1"),
    },
  };
}

export async function searchTiresBySize(
  size: TireSize,
  searchParams: URLSearchParams,
): Promise<TireSearchResult> {
  const basePath = `/pneus/${formatSizeSlug(size)}`;
  const filters = parseTireFilters(searchParams);

  const sameProfileTires = await tireRepository.findByWidthAndProfile({
    width: size.width,
    aspectRatio: size.aspectRatio,
  });
  const sameRimTires = sameProfileTires.filter(
    (tire) => tire.rimDiameter === size.rimDiameter,
  );

  const filtered = sortTires(
    sameRimTires.filter((tire) => matchesFilters(tire, filters)),
    filters.sort,
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const tires = filtered.slice(start, start + PAGE_SIZE);

  const facets = buildFacets(
    basePath,
    searchParams,
    sameRimTires,
    sameProfileTires,
    filters,
    size,
  );

  return {
    size,
    sizeLabel: formatSizeLabel(size),
    tires,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
    sort: filters.sort,
    facets,
  };
}
