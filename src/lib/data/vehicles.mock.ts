// Fonte de dados mockada da busca por veículo. Linhas planas, no mesmo
// formato que as tabelas VehicleBrand/VehicleModel/VehicleYear/
// VehicleVersion/VehicleTireSize do Prisma — importar milhares de veículos
// no futuro é só inserir mais linhas nestes mesmos formatos (seed/CSV),
// sem mudar a modelagem nem o código que consome estes dados.
//
// Base pequena, apenas para validar o fluxo de ponta a ponta.

export type VehicleBrandRow = { id: string; slug: string; name: string };

export type VehicleModelRow = {
  id: string;
  slug: string;
  name: string;
  brandId: string;
};

export type VehicleYearRow = { id: string; year: number; modelId: string };

export type VehicleVersionRow = {
  id: string;
  slug: string;
  trim: string;
  engine: string | null;
  yearId: string;
};

export type VehicleTireSizeRow = {
  versionId: string;
  width: number;
  aspectRatio: number;
  rimDiameter: number;
  isOriginal: boolean;
};

export const vehicleBrandRows: VehicleBrandRow[] = [
  { id: "brand-toyota", slug: "toyota", name: "Toyota" },
  { id: "brand-chevrolet", slug: "chevrolet", name: "Chevrolet" },
  { id: "brand-volkswagen", slug: "volkswagen", name: "Volkswagen" },
];

export const vehicleModelRows: VehicleModelRow[] = [
  {
    id: "model-corolla",
    slug: "corolla",
    name: "Corolla",
    brandId: "brand-toyota",
  },
  { id: "model-hilux", slug: "hilux", name: "Hilux", brandId: "brand-toyota" },
  { id: "model-onix", slug: "onix", name: "Onix", brandId: "brand-chevrolet" },
  { id: "model-gol", slug: "gol", name: "Gol", brandId: "brand-volkswagen" },
];

export const vehicleYearRows: VehicleYearRow[] = [
  { id: "year-corolla-2020", year: 2020, modelId: "model-corolla" },
  { id: "year-corolla-2021", year: 2021, modelId: "model-corolla" },
  { id: "year-hilux-2022", year: 2022, modelId: "model-hilux" },
  { id: "year-onix-2021", year: 2021, modelId: "model-onix" },
  { id: "year-gol-2019", year: 2019, modelId: "model-gol" },
];

export const vehicleVersionRows: VehicleVersionRow[] = [
  {
    id: "version-corolla-2020-xei",
    slug: "xei-2-0-flex",
    trim: "XEi",
    engine: "2.0 Flex",
    yearId: "year-corolla-2020",
  },
  {
    id: "version-corolla-2021-xei",
    slug: "xei-2-0-flex",
    trim: "XEi",
    engine: "2.0 Flex",
    yearId: "year-corolla-2021",
  },
  {
    id: "version-hilux-2022-srv",
    slug: "srv-2-8-diesel",
    trim: "SRV",
    engine: "2.8 Diesel",
    yearId: "year-hilux-2022",
  },
  // Mesmo trim ("LT") com duas motorizações no mesmo ano: a busca precisa
  // perguntar a motorização como um passo extra ("quando necessário").
  {
    id: "version-onix-2021-lt-flex",
    slug: "lt-1-0-flex",
    trim: "LT",
    engine: "1.0 Flex",
    yearId: "year-onix-2021",
  },
  {
    id: "version-onix-2021-lt-turbo",
    slug: "lt-1-0-turbo",
    trim: "LT",
    engine: "1.0 Turbo",
    yearId: "year-onix-2021",
  },
  {
    id: "version-onix-2021-ltz",
    slug: "ltz-1-0-turbo",
    trim: "LTZ",
    engine: "1.0 Turbo",
    yearId: "year-onix-2021",
  },
  {
    id: "version-gol-2019-msi",
    slug: "msi-1-6-flex",
    trim: "MSI",
    engine: "1.6 Flex",
    yearId: "year-gol-2019",
  },
];

export const vehicleTireSizeRows: VehicleTireSizeRow[] = [
  {
    versionId: "version-corolla-2020-xei",
    width: 205,
    aspectRatio: 55,
    rimDiameter: 16,
    isOriginal: true,
  },
  {
    versionId: "version-corolla-2021-xei",
    width: 205,
    aspectRatio: 55,
    rimDiameter: 16,
    isOriginal: true,
  },
  {
    versionId: "version-hilux-2022-srv",
    width: 225,
    aspectRatio: 65,
    rimDiameter: 17,
    isOriginal: true,
  },
  {
    versionId: "version-onix-2021-lt-flex",
    width: 185,
    aspectRatio: 65,
    rimDiameter: 15,
    isOriginal: true,
  },
  {
    versionId: "version-onix-2021-lt-turbo",
    width: 185,
    aspectRatio: 65,
    rimDiameter: 15,
    isOriginal: true,
  },
  {
    versionId: "version-onix-2021-ltz",
    width: 185,
    aspectRatio: 65,
    rimDiameter: 15,
    isOriginal: true,
  },
  {
    versionId: "version-gol-2019-msi",
    width: 175,
    aspectRatio: 70,
    rimDiameter: 13,
    isOriginal: true,
  },
];
