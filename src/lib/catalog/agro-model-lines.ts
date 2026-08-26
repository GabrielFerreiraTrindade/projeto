// Pneus agrícolas e OTR (fora de estrada) — segmento novo, formato radial
// métrico (largura/perfil R aro, ex: "800/70R38"), mesmo esquema de dados de
// carro/caminhão (sem precisar de mais nenhuma mudança de schema). Pneus
// agrícolas diagonais tradicionais (ex: Pirelli TM95 "18.4-30") usam largura
// em polegadas decimais sem "/perfil R" — formato incompatível com o schema
// atual (width é Int); por isso, entre as linhas confirmadas de cada marca,
// priorizamos as versões radiais métricas equivalentes, que cobrem os
// mesmos tratores de grande porte.
//
// Só 3 das marcas do catálogo têm linha agrícola documentada à venda no
// Brasil: Pirelli, Goodyear e Firestone — as "melhores"/mais tradicionais do
// segmento no país (Firestone historicamente é a marca mais associada a
// pneu de trator no Brasil; Goodyear e Pirelli têm linhas agrícolas
// robustas e catálogo local). As outras marcas do catálogo (Michelin,
// Continental, Bridgestone, Yokohama, Dunlop, Hankook, Xbri, Westlake) não têm linha
// agrícola/OTR documentada à venda no Brasil.
export type AgroSize = {
  width: number;
  aspectRatio: number;
  rim: number;
  loadIndex: string;
  speedIndex: string;
  confirmed: boolean;
  price: number;
  priceConfirmed: boolean;
};

export type AgroModelLine = {
  brandName: string;
  modelName: string;
  positioning: "economy" | "premium";
  sizes: AgroSize[];
  evidence: string;
};

export const AGRO_MODEL_LINES: AgroModelLine[] = [
  {
    brandName: "Goodyear",
    modelName: "OptiTrac DT830",
    positioning: "premium",
    sizes: [
      {
        width: 800,
        aspectRatio: 70,
        rim: 38,
        loadIndex: "179",
        speedIndex: "A8",
        confirmed: true,
        price: 9500,
        priceConfirmed: false,
      },
    ],
    evidence:
      "Radial R-1W para tratores de grande porte, roda traseira. Medida 800/70R38 179A8 TL confirmada em varejista brasileiro (pneustok.com.br). Preço não confirmado nesta medida/modelo específico — estimado a partir de uma cotação confirmada de outro pneu Goodyear de porte comparável (Dyna Torque II 18.4-30 12 Lonas HD TL R1, R$ 9.212,05 na Tristão Pneus), mesma faixa de pneu agrícola de tração para trator grande.",
  },
  {
    brandName: "Pirelli",
    modelName: "PHP:70",
    positioning: "premium",
    sizes: [
      {
        width: 710,
        aspectRatio: 70,
        rim: 38,
        loadIndex: "171",
        speedIndex: "D",
        confirmed: true,
        price: 6500,
        priceConfirmed: false,
      },
    ],
    evidence:
      "Radial R-1W recomendado para tratores, colheitadeiras e pulverizadores em solo firme. Medida 710/70R38 171D TL confirmada em varejistas brasileiros (Bellenzier, Agrotrator, SagaPneus). Preço não confirmado nesta medida — estimado por comparação com a cotação confirmada do TM95 18.4-30 da mesma marca (R$ 5.774,53 a R$ 6.268,81, PneuStore/Bellenzier), ajustado para o porte um pouco maior do 710/70R38.",
  },
  {
    brandName: "Firestone",
    modelName: "Radial All Traction DT",
    positioning: "economy",
    sizes: [
      {
        width: 600,
        aspectRatio: 70,
        rim: 30,
        loadIndex: "155",
        speedIndex: "A8",
        confirmed: true,
        price: 4200,
        priceConfirmed: false,
      },
    ],
    evidence:
      "Radial R-1W de tração, barras altas para maior aderência ao solo. Medida 600/70R30 confirmada em varejista brasileiro (digap.com.br, código PAGF362). Preço não confirmado nesta medida — estimada por ordem de grandeza abaixo dos pneus 38\" de Goodyear/Pirelli acima, por ser um aro menor (30\") e classe de trator mais leve.",
  },
];
