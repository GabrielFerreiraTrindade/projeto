import { vehicleRepository } from "@/lib/repositories/vehicle-repository";
import type {
  VehicleCatalogTree,
  VehicleSearchResult,
  VehicleSelectionPath,
} from "@/types/vehicle";

// Camada de serviço da busca por veículo: monta a árvore usada pela busca
// em cascata e resolve uma seleção (marca/modelo/ano/versão) nas medidas de
// pneu compatíveis. Não sabe nada sobre React nem sobre como os dados são
// armazenados.

/** Árvore completa (marca > modelo > ano > versão) para a busca em cascata no cliente. */
export async function getVehicleCatalogTree(): Promise<VehicleCatalogTree> {
  const brands = await vehicleRepository.findBrands();

  const tree = await Promise.all(
    brands.map(async (brand) => {
      const models = await vehicleRepository.findModelsByBrand(brand.id);

      const modelsWithYears = await Promise.all(
        models.map(async (model) => {
          const years = await vehicleRepository.findYearsByModel(model.id);

          const yearsWithVersions = await Promise.all(
            years.map(async (year) => {
              const versions = await vehicleRepository.findVersionsByYear(
                year.id,
              );
              return {
                id: year.id,
                year: year.year,
                versions: versions.map((version) => ({
                  id: version.id,
                  slug: version.slug,
                  trim: version.trim,
                  engine: version.engine,
                })),
              };
            }),
          );

          return {
            id: model.id,
            slug: model.slug,
            name: model.name,
            years: yearsWithVersions,
          };
        }),
      );

      return {
        id: brand.id,
        slug: brand.slug,
        name: brand.name,
        models: modelsWithYears,
      };
    }),
  );

  return { brands: tree };
}

function formatVehicleLabel(
  brandName: string,
  modelName: string,
  year: number,
  trim: string,
  engine: string | null,
): string {
  const parts = [brandName, modelName, String(year), trim];
  if (engine) parts.push(engine);
  return parts.join(" ");
}

/** Resolve marca/modelo/ano/versão (pela URL amigável) nas medidas de pneu compatíveis. */
export async function resolveVehicleSelection(
  path: VehicleSelectionPath,
): Promise<VehicleSearchResult | null> {
  const brand = await vehicleRepository.findBrandBySlug(path.brandSlug);
  if (!brand) return null;

  const model = await vehicleRepository.findModelBySlug(
    brand.id,
    path.modelSlug,
  );
  if (!model) return null;

  const year = await vehicleRepository.findYearByValue(model.id, path.year);
  if (!year) return null;

  const version = await vehicleRepository.findVersionBySlug(
    year.id,
    path.versionSlug,
  );
  if (!version) return null;

  return {
    brand,
    model,
    year,
    version,
    label: formatVehicleLabel(
      brand.name,
      model.name,
      year.year,
      version.trim,
      version.engine,
    ),
    sizes: version.sizes,
  };
}

/** Monta a URL amigável /veiculo/[marca]/[modelo]/[ano]/[versao]. */
export function formatVehiclePath(path: VehicleSelectionPath): string {
  return `/veiculo/${path.brandSlug}/${path.modelSlug}/${path.year}/${path.versionSlug}`;
}
