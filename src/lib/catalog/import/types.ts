// Formato de entrada aceito pelo importador (/admin/importar-produtos).
// As colunas/campos abaixo são o "contrato" desta loja — não correspondem a
// nenhuma API externa (não existe uma API fixa acordada com fornecedores
// ainda). CSV usa estas mesmas chaves como cabeçalho; JSON como chaves de
// objeto; XML como elementos filhos de <product>.
export type ImportRowInput = {
  brand?: string;
  tireModel?: string;
  width?: string;
  aspectRatio?: string;
  rim?: string;
  loadIndex?: string;
  speedIndex?: string;
  price?: string;
  compareAtPrice?: string;
  sku?: string;
  description?: string;
  source?: string;
  sourceUrl?: string;
  vehicleType?: string;
  runFlat?: string;
};

export type ImportRowStatus = "valid" | "rejected" | "duplicate";

export type ImportRowResult = {
  row: number;
  input: ImportRowInput;
  status: ImportRowStatus;
  reasons: string[];
  resolved?: {
    sku: string;
    slug: string;
    brandName: string;
    tireModelName: string;
    width: number;
    aspectRatio: number;
    rim: number;
    loadIndex: string;
    speedIndex: string;
    price: number;
    compareAtPrice: number | null;
    description: string;
    source: string | null;
    sourceUrl: string | null;
    vehicleType: "PASSENGER" | "SUV" | "LIGHT_TRUCK" | "MOTORCYCLE";
    runFlat: boolean;
    rankingPosition: "FIRST" | "SECOND";
  };
};

export type ImportReport = {
  totalRows: number;
  validCount: number;
  rejectedCount: number;
  duplicateCount: number;
  results: ImportRowResult[];
};

export type ImportFormat = "csv" | "json" | "xml";
