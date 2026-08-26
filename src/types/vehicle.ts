import type { TireSize } from "@/types/catalog";

// Tipos da busca por veículo (marca > modelo > ano > versão > motorização).
// Espelham a cadeia relacional do Prisma (VehicleBrand, VehicleModel,
// VehicleYear, VehicleVersion, VehicleTireSize).

export type VehicleBrand = {
  id: string;
  slug: string;
  name: string;
};

export type VehicleModel = {
  id: string;
  slug: string;
  name: string;
  brandId: string;
};

export type VehicleYear = {
  id: string;
  year: number;
  modelId: string;
};

// Uma versão já representa a combinação trim + motorização (ex: "XEi" +
// "2.0 Flex"). Quando o mesmo trim tem mais de uma motorização disponível
// no mesmo ano, a UI pergunta a motorização como um passo extra.
export type VehicleVersion = {
  id: string;
  slug: string;
  trim: string;
  engine: string | null;
  yearId: string;
  sizes: TireSize[];
};

// Árvore completa usada pela busca em cascata no cliente (dataset pequeno,
// então é seguro enviar tudo de uma vez).
export type VehicleCatalogTree = {
  brands: {
    id: string;
    slug: string;
    name: string;
    models: {
      id: string;
      slug: string;
      name: string;
      years: {
        id: string;
        year: number;
        versions: {
          id: string;
          slug: string;
          trim: string;
          engine: string | null;
        }[];
      }[];
    }[];
  }[];
};

export type VehicleSelectionPath = {
  brandSlug: string;
  modelSlug: string;
  year: number;
  versionSlug: string;
};

export type VehicleSearchResult = {
  brand: VehicleBrand;
  model: VehicleModel;
  year: VehicleYear;
  version: VehicleVersion;
  label: string;
  sizes: TireSize[];
};
