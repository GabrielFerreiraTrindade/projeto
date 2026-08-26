import {
  vehicleBrandRows,
  vehicleModelRows,
  vehicleTireSizeRows,
  vehicleVersionRows,
  vehicleYearRows,
} from "@/lib/data/vehicles.mock";
import type {
  VehicleBrand,
  VehicleModel,
  VehicleVersion,
  VehicleYear,
} from "@/types/vehicle";

// Camada de acesso a dados da busca por veículo.
//
// Hoje lê das linhas mockadas em src/lib/data/vehicles.mock.ts. Quando o
// banco estiver pronto, troque a implementação por consultas Prisma nos
// models VehicleBrand/VehicleModel/VehicleYear/VehicleVersion/
// VehicleTireSize, mantendo a mesma assinatura.

function toVersion(row: (typeof vehicleVersionRows)[number]): VehicleVersion {
  const sizes = vehicleTireSizeRows
    .filter((size) => size.versionId === row.id)
    .map((size) => ({
      width: size.width,
      aspectRatio: size.aspectRatio,
      rimDiameter: size.rimDiameter,
    }));

  return {
    id: row.id,
    slug: row.slug,
    trim: row.trim,
    engine: row.engine,
    yearId: row.yearId,
    sizes,
  };
}

export interface VehicleRepository {
  findBrands(): Promise<VehicleBrand[]>;
  findBrandBySlug(slug: string): Promise<VehicleBrand | null>;
  findModelsByBrand(brandId: string): Promise<VehicleModel[]>;
  findModelBySlug(brandId: string, slug: string): Promise<VehicleModel | null>;
  findYearsByModel(modelId: string): Promise<VehicleYear[]>;
  findYearByValue(modelId: string, year: number): Promise<VehicleYear | null>;
  findVersionsByYear(yearId: string): Promise<VehicleVersion[]>;
  findVersionBySlug(
    yearId: string,
    slug: string,
  ): Promise<VehicleVersion | null>;
}

class MockVehicleRepository implements VehicleRepository {
  async findBrands(): Promise<VehicleBrand[]> {
    return vehicleBrandRows.map(({ id, slug, name }) => ({ id, slug, name }));
  }

  async findBrandBySlug(slug: string): Promise<VehicleBrand | null> {
    const row = vehicleBrandRows.find((brand) => brand.slug === slug);
    return row ? { id: row.id, slug: row.slug, name: row.name } : null;
  }

  async findModelsByBrand(brandId: string): Promise<VehicleModel[]> {
    return vehicleModelRows
      .filter((model) => model.brandId === brandId)
      .map(({ id, slug, name, brandId: bId }) => ({
        id,
        slug,
        name,
        brandId: bId,
      }));
  }

  async findModelBySlug(
    brandId: string,
    slug: string,
  ): Promise<VehicleModel | null> {
    const row = vehicleModelRows.find(
      (model) => model.brandId === brandId && model.slug === slug,
    );
    return row
      ? { id: row.id, slug: row.slug, name: row.name, brandId: row.brandId }
      : null;
  }

  async findYearsByModel(modelId: string): Promise<VehicleYear[]> {
    return vehicleYearRows
      .filter((year) => year.modelId === modelId)
      .sort((a, b) => b.year - a.year)
      .map(({ id, year, modelId: mId }) => ({ id, year, modelId: mId }));
  }

  async findYearByValue(
    modelId: string,
    year: number,
  ): Promise<VehicleYear | null> {
    const row = vehicleYearRows.find(
      (item) => item.modelId === modelId && item.year === year,
    );
    return row ? { id: row.id, year: row.year, modelId: row.modelId } : null;
  }

  async findVersionsByYear(yearId: string): Promise<VehicleVersion[]> {
    return vehicleVersionRows
      .filter((version) => version.yearId === yearId)
      .map(toVersion);
  }

  async findVersionBySlug(
    yearId: string,
    slug: string,
  ): Promise<VehicleVersion | null> {
    const row = vehicleVersionRows.find(
      (version) => version.yearId === yearId && version.slug === slug,
    );
    return row ? toVersion(row) : null;
  }
}

export const vehicleRepository: VehicleRepository = new MockVehicleRepository();
