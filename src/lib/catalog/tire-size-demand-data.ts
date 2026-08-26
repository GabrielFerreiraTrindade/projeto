// Dados de pesquisa de demanda por medida de pneu, usados para popular
// TireSizeDemand (ver prisma/seed.ts) e para priorizar quais medidas
// recebem produtos no catálogo inicial.
//
// Metodologia e limitações (ver CATALOG_RESEARCH.md para o relatório
// completo): as classificações HIGH/MEDIUM/LOW refletem popularidade
// observada em fontes públicas (artigos especializados, catálogos de
// fabricante por medida, associação a modelos de carro populares no
// Brasil) — não existe estatística oficial e pública de volume de vendas
// por medida de pneu no Brasil, e nenhuma fonte encontrada quebra os dados
// por estado. Por isso "minasGeraisRelevance" nunca é maior do que a
// evidência nacional: quando não há fonte específica de Minas Gerais, o
// campo repete a relevância nacional com uma nota explícita de que é uma
// inferência (Minas Gerais é a 3ª maior frota de veículos do Brasil,
// ~12,4 milhões de veículos segundo a CET-MG/Diário do Comércio), não um
// dado direto.
export type ScoreLevel = "HIGH" | "MEDIUM" | "LOW";

export type TireSizeDemandSeed = {
  width: number;
  aspectRatio: number;
  rim: number;
  demandScore: ScoreLevel;
  brazilRelevance: ScoreLevel;
  minasGeraisRelevance: ScoreLevel;
  sources: string;
};

const MG_INFERENCE_NOTE =
  "Sem fonte específica de Minas Gerais; valor repete a relevância nacional por inferência (MG é a 3ª maior frota do Brasil, ~12,4 milhões de veículos — Diário do Comércio/CET-MG), não é um dado direto de vendas por medida no estado.";

export const TIRE_SIZE_DEMAND_SEED: TireSizeDemandSeed[] = [
  {
    width: 175,
    aspectRatio: 65,
    rim: 14,
    demandScore: "HIGH",
    brazilRelevance: "HIGH",
    minasGeraisRelevance: "HIGH",
    sources: `Full Pneus — "Quais as medidas de pneus mais vendidos de carros de passeio": cita 175/65 R14 equipando Fiat Palio, Ford Fiesta, VW Gol e Renault Clio (https://www.fullpneus.com.br/quais-as-medidas-de-pneus-mais-vendidos-de-carros-de-passeio-confira). ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 175,
    aspectRatio: 70,
    rim: 14,
    demandScore: "HIGH",
    brazilRelevance: "HIGH",
    minasGeraisRelevance: "HIGH",
    sources: `Full Pneus — mesma fonte acima, cita 175/70 R14 como medida popular em compactos de entrada. Griffe Pneus — "Pneu aro 14" descreve o aro 14 como um dos mais populares do mercado brasileiro (https://griffepneus.com.br/dicas-pneus/pneu-aro-14-principais-caracteristicas-e-em-quais-carros-e-mais-usado/). ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 185,
    aspectRatio: 65,
    rim: 15,
    demandScore: "HIGH",
    brazilRelevance: "HIGH",
    minasGeraisRelevance: "HIGH",
    sources: `Full Pneus — "Quais os pneus e medidas mais usados no mercado brasileiro" lista 185/65 R15 entre as medidas mais vendidas (https://www.fullpneus.com.br/quais-os-pneus-e-medidas-mais-usados-no-mercado-brasileiro). ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 195,
    aspectRatio: 55,
    rim: 15,
    demandScore: "MEDIUM",
    brazilRelevance: "MEDIUM",
    minasGeraisRelevance: "MEDIUM",
    sources: `Full Pneus — mesma fonte acima, lista 195/55 R15 entre as medidas mais vendidas no Brasil. ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 195,
    aspectRatio: 60,
    rim: 15,
    demandScore: "MEDIUM",
    brazilRelevance: "MEDIUM",
    minasGeraisRelevance: "MEDIUM",
    sources: `Full Pneus — mesma fonte acima, lista 195/60 R15 entre as medidas mais vendidas no Brasil. ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 195,
    aspectRatio: 65,
    rim: 15,
    demandScore: "HIGH",
    brazilRelevance: "HIGH",
    minasGeraisRelevance: "HIGH",
    sources: `Full Pneus — cita 195/65 R15 equipando Chevrolet Onix, Hyundai HB20, Toyota Corolla e VW Golf, descrevendo-a como "uma das mais comuns e importantes do mercado brasileiro" (https://www.fullpneus.com.br/quais-as-medidas-de-pneus-mais-vendidos-de-carros-de-passeio-confira). ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 205,
    aspectRatio: 55,
    rim: 16,
    demandScore: "MEDIUM",
    brazilRelevance: "MEDIUM",
    minasGeraisRelevance: "MEDIUM",
    sources: `Full Pneus — "Quais os pneus e medidas mais usados no mercado brasileiro" lista 205/55 R16 entre as medidas mais vendidas. ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 205,
    aspectRatio: 60,
    rim: 16,
    demandScore: "MEDIUM",
    brazilRelevance: "MEDIUM",
    minasGeraisRelevance: "MEDIUM",
    sources: `Full Pneus — mesma fonte acima, lista 205/60 R16 entre as medidas mais vendidas. ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 205,
    aspectRatio: 65,
    rim: 15,
    demandScore: "MEDIUM",
    brazilRelevance: "MEDIUM",
    minasGeraisRelevance: "MEDIUM",
    sources: `Full Pneus — mesma fonte acima, lista 205/65 R15 entre as medidas mais vendidas. ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 205,
    aspectRatio: 65,
    rim: 16,
    demandScore: "HIGH",
    brazilRelevance: "HIGH",
    minasGeraisRelevance: "HIGH",
    sources: `Busca setorial — 205/65 R16 descrita como "extremamente popular no Brasil", equipando Hyundai Creta, Renault Duster e Nissan Kicks (SUVs compactos, um dos segmentos que mais cresce em vendas no Brasil). ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 215,
    aspectRatio: 55,
    rim: 17,
    demandScore: "MEDIUM",
    brazilRelevance: "MEDIUM",
    minasGeraisRelevance: "MEDIUM",
    sources: `Full Pneus — "Quais os pneus e medidas mais usados no mercado brasileiro" lista 215/55 R17 entre as medidas mais vendidas. ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 215,
    aspectRatio: 60,
    rim: 17,
    demandScore: "MEDIUM",
    brazilRelevance: "MEDIUM",
    minasGeraisRelevance: "MEDIUM",
    sources: `Pirelli mantém página própria de catálogo por medida para 215/60 R17 (https://www.pirelli.com/tyres/pt-br/carro/catalogo-pneus/por-medida/215_60-r17), indicando relevância comercial suficiente para o fabricante organizar o catálogo por essa medida especificamente. Sem citação de volume de vendas. ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 225,
    aspectRatio: 45,
    rim: 17,
    demandScore: "MEDIUM",
    brazilRelevance: "MEDIUM",
    minasGeraisRelevance: "MEDIUM",
    sources: `Full Pneus — mesma fonte acima, lista 225/45 R17 entre as medidas mais vendidas (sedãs esportivos/médios). ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 225,
    aspectRatio: 65,
    rim: 17,
    demandScore: "HIGH",
    brazilRelevance: "HIGH",
    minasGeraisRelevance: "HIGH",
    sources: `Busca setorial — 225/65 R17 indicada para SUVs médios como Hyundai Tucson, Honda CR-V, Toyota RAV4 e Nissan X-Trail (segmento SUV médio, em crescimento no Brasil). Pirelli mantém página própria de catálogo por medida para 225/65 R17 (https://www.pirelli.com/tyres/pt-br/carro/catalogo-pneus/por-medida/225_65-r17). ${MG_INFERENCE_NOTE}`,
  },
  // Aros 18 a 23 — segmento de SUVs/picapes de maior porte e versões
  // esportivas/premium. Dados mais escassos que aro 14-17: menos fontes
  // brasileiras discutem popularidade por medida nesses aros (mercado menor
  // e mais pulverizado por marca/versão de veículo), o que já está refletido
  // nas classificações abaixo (nenhuma é HIGH nesses aros por falta de
  // evidência tão forte quanto a dos aros 14-17).
  {
    width: 225,
    aspectRatio: 55,
    rim: 18,
    demandScore: "MEDIUM",
    brazilRelevance: "MEDIUM",
    minasGeraisRelevance: "MEDIUM",
    sources: `225/55 R18 é uma das medidas mais citadas para aro 18 no Brasil, equipando SUVs compactos como Jeep Compass e Jeep Renegade (https://www.pneus.org/pneu-aro-18, https://www.dpaschoal.com.br/pneus-e-camaras/suv-e-caminhonete/aro-18). ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 235,
    aspectRatio: 60,
    rim: 18,
    demandScore: "LOW",
    brazilRelevance: "LOW",
    minasGeraisRelevance: "LOW",
    sources: `235/60 R18 é citada para o Fiat Toro Volcano (SUV/picape média popular no Brasil), dentro da lista de medidas de aro 18 (https://www.pneus.org/pneu-aro-18). Sem citação de volume de vendas. ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 235,
    aspectRatio: 55,
    rim: 19,
    demandScore: "MEDIUM",
    brazilRelevance: "MEDIUM",
    minasGeraisRelevance: "MEDIUM",
    sources: `235/55 R19 é descrita como medida comum para SUVs/crossovers de aro 19, associada a modelos vendidos no Brasil como Hyundai Tucson, Kia Sportage, Toyota RAV4 e Mercedes-Benz GLC (https://savellipneus.com.br/pneu-aro-19-235-55-245-45-ou-255-50-entenda-as-diferencas-antes-de-comprar/, catálogo por medida da Pirelli e da Michelin). ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 245,
    aspectRatio: 45,
    rim: 20,
    demandScore: "MEDIUM",
    brazilRelevance: "MEDIUM",
    minasGeraisRelevance: "MEDIUM",
    sources: `245/45 R20 citada entre as medidas mais procuradas de aro 20, equipando picapes/SUVs como Ford Ranger, Chevrolet S10, Porsche Cayenne e BMW X3/X5 vendidos no Brasil. Pirelli mantém catálogo próprio por medida para aro 20 (https://www.pirelli.com/tyres/pt-br/carro/catalogo-pneus/por-medida/20-pneu-aro). ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 255,
    aspectRatio: 35,
    rim: 20,
    demandScore: "LOW",
    brazilRelevance: "LOW",
    minasGeraisRelevance: "LOW",
    sources: `255/35 R20 citada entre as medidas mais procuradas de aro 20, perfil mais esportivo/baixo (segmento de nicho). Sem citação de volume de vendas. ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 265,
    aspectRatio: 45,
    rim: 21,
    demandScore: "LOW",
    brazilRelevance: "LOW",
    minasGeraisRelevance: "LOW",
    sources: `265/45 R21 citada como opção disponível para SUVs/picapes de aro 21 no mercado brasileiro, aro pouco discutido em fontes de popularidade (fabricação em menor escala, carcaça reforçada, menor disponibilidade). Sem citação de volume de vendas ou de modelo de veículo específico. ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 265,
    aspectRatio: 40,
    rim: 22,
    demandScore: "LOW",
    brazilRelevance: "LOW",
    minasGeraisRelevance: "LOW",
    sources: `265/40 R22 listada por distribuidores brasileiros especializados em pneus de aro 22 para picapes/SUVs premium (https://www.tireshop.com.br/1/34/Pneus-Pick-ups-e-SUVs_Pneu-Aro-22, https://www.ciapneus.com.br/suv-e-caminhonete-aro-22). Segmento de nicho (versões de topo), sem citação de volume de vendas. ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 285,
    aspectRatio: 45,
    rim: 22,
    demandScore: "LOW",
    brazilRelevance: "LOW",
    minasGeraisRelevance: "LOW",
    sources: `285/45 R22 listada entre as medidas disponíveis de aro 22 para SUVs/picapes de grande porte por distribuidores brasileiros (https://www.pneubarato.com.br/pneu/caminhonete-e-suv/aro-22, https://www.showpneus.com.br/caminhonete-e-suv/aro-22). Sem citação de volume de vendas. ${MG_INFERENCE_NOTE}`,
  },
  {
    width: 285,
    aspectRatio: 40,
    rim: 23,
    demandScore: "LOW",
    brazilRelevance: "LOW",
    minasGeraisRelevance: "LOW",
    sources: `285/40 R23 é uma das poucas medidas de aro 23 efetivamente comercializadas no Brasil segundo distribuidores especializados (https://www.mercadolivre.com.br — busca "pneu aro 23"; outras medidas de aro 23 citadas: 305/35R23, 275/35R23). Segmento de nicho (tuning/rodas de grande diâmetro), nenhuma fonte associa a um volume de vendas ou a um modelo de veículo específico popular no Brasil. ${MG_INFERENCE_NOTE}`,
  },
];
