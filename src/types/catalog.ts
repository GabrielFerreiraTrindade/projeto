// Tipos usados pela camada de apresentação (mock). Não correspondem 1:1 ao
// schema do Prisma — esta etapa ainda não está ligada ao banco de dados.

export type ProductCategory =
  | "carro"
  | "suv-caminhonete"
  | "moto"
  | "van-e-utilitario"
  | "caminhao-e-onibus"
  | "agricola-e-otr"
  | "kit-de-pneus";

export type SpeedRating = "Q" | "S" | "T" | "H" | "V" | "W" | "Y";

export type Availability = "in_stock" | "low_stock" | "out_of_stock";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model?: string;
  description?: string;
  size: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  installments?: {
    count: number;
    value: number;
  };
  rating: number;
  reviewCount: number;
  isOffer?: boolean;
  isBestSeller?: boolean;
  freeShipping?: boolean;
  /** 1 = pneu avulso, 2/4 = kit do mesmo modelo+medida. */
  packQuantity?: number;
  /** URLs das fotos autorizadas do produto (vazio = sem foto autorizada ainda). */
  images?: string[];
  width?: number;
  /** null = pneu comercial sem número de perfil (ex: van "185 R14"). */
  aspectRatio?: number | null;
  rimDiameter?: number;
  loadIndex?: string;
  speedRating?: SpeedRating;
  runFlat?: boolean;
  availability?: Availability;
};

// Pneu do catálogo de busca por medida: as mesmas propriedades de Product,
// mas com medida e especificações técnicas sempre preenchidas. Usa Omit
// porque "aspectRatio" aqui precisa aceitar null (pneu comercial sem
// número de perfil) — uma interseção direta com Product (que declara
// aspectRatio como number opcional) reduziria o tipo de volta pra só
// "number", perdendo o null.
export type Tire = Omit<Product, "aspectRatio"> & {
  model: string;
  description: string;
  width: number;
  /** null = pneu comercial sem número de perfil (ex: van "185 R14"). */
  aspectRatio: number | null;
  rimDiameter: number;
  loadIndex: string;
  speedRating: SpeedRating;
  runFlat: boolean;
  availability: Availability;
};

export type TireSize = {
  width: number;
  aspectRatio: number;
  rimDiameter: number;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  productName: string;
  date: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type SortOption =
  | "relevancia"
  | "menor-preco"
  | "maior-preco"
  | "mais-vendidos"
  | "melhor-avaliados";

export type PriceRangeId = "ate-300" | "300-500" | "500-800" | "acima-800";

export type TireFilters = {
  brands: string[];
  rimDiameters: number[];
  priceRanges: PriceRangeId[];
  loadIndexes: string[];
  speedRatings: string[];
  vehicleTypes: ProductCategory[];
  availabilities: Availability[];
  runFlatOnly: boolean;
  sort: SortOption;
  page: number;
};

export type FacetOption<T = string> = {
  value: T;
  label: string;
  count: number;
  active: boolean;
  href: string;
};

export type TireFacets = {
  brands: FacetOption[];
  rimDiameters: FacetOption<number>[];
  priceRanges: FacetOption<PriceRangeId>[];
  loadIndexes: FacetOption[];
  speedRatings: FacetOption[];
  vehicleTypes: FacetOption<ProductCategory>[];
  availabilities: FacetOption<Availability>[];
  runFlat: { active: boolean; href: string; count: number };
};

export type TireSearchResult = {
  size: TireSize;
  sizeLabel: string;
  tires: Tire[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: SortOption;
  facets: TireFacets;
};
