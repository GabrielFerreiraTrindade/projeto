// Configuração das marcas prioritárias do catálogo.
//
// Lista definida a partir de uma etapa de pesquisa (ver CATALOG_RESEARCH.md
// na raiz do projeto para o relatório completo, fontes e limitações).
// Nenhuma marca foi escolhida apenas por ser famosa: cada uma tem pelo menos
// uma evidência de presença/relevância no mercado brasileiro e, quando
// encontrada, no mercado de Minas Gerais — mas nenhuma fonte consultada
// publica um ranking oficial e verificável de participação de mercado por
// marca no Brasil. "Volume de vendas não disponível publicamente" para
// praticamente todas as marcas — ver o relatório para o detalhamento por
// marca.
//
// Alterar esta lista é uma decisão administrativa explícita (não deve ser
// sobrescrita automaticamente por nenhuma importação).
export const TOP_TIRE_BRANDS = [
  "Pirelli",
  "Bridgestone",
  "Goodyear",
  "Michelin",
  "Continental",
  "Yokohama",
  "Dunlop",
  "Firestone",
  "Hankook",
  "Xbri",
  "Westlake",
] as const;

export type TopTireBrand = (typeof TOP_TIRE_BRANDS)[number];

export const TOP_BRANDS_LIMIT = 11;

if (TOP_TIRE_BRANDS.length !== TOP_BRANDS_LIMIT) {
  throw new Error(
    `TOP_TIRE_BRANDS deve conter exatamente ${TOP_BRANDS_LIMIT} marcas (encontradas: ${TOP_TIRE_BRANDS.length}).`,
  );
}

/** Máximo de modelos de uma mesma marca para uma mesma medida. Regra fundamental do catálogo. */
export const MAX_MODELS_PER_BRAND_PER_SIZE = 2;
