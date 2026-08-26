// Pneus de caminhão/ônibus (18 rodas, aro fracionário 22.5") — segmento
// completamente diferente de carro/SUV/van em porte e sizing.
//
// Primeira rodada: Bridgestone, Michelin e Firestone (linha + medida
// confirmadas com fonte específica).
//
// Segunda rodada, acrescentando as outras marcas mais vendidas do segmento:
// Goodyear (KMax D Traction), Continental (duas linhas — HDC1+ e HTR1, cada
// uma confirmada numa medida diferente, por isso entram como duas linhas
// separadas em vez de uma única linha "genérica" nas duas medidas) e Pirelli
// (FG85). Xbri, Hankook, Dunlop e Yokohama não têm linha de caminhão/ônibus
// documentada à venda no Brasil.
// price: pesquisado em varejo (MercadoLivre, OLX, Truck Center Pneus, Bellenzier,
// PneuStore) — faixa observada de R$2.000 a R$3.000 para 275/80R22.5, com uma
// linha econômica (Michelin X Works, não confiundir com X Multi Z) encontrada
// a R$1.540. Usada faixa economy ~R$1.900/premium ~R$2.300 em 275, um pouco
// mais para 295 (pneu maior).
export type TruckSize = {
  width: number;
  aspectRatio: number;
  rim: number;
  loadIndex: string;
  speedIndex: string;
  confirmed: boolean;
  price: number;
};

export type TruckModelLine = {
  brandName: string;
  modelName: string;
  positioning: "economy" | "premium";
  sizes: TruckSize[];
  evidence: string;
};

export const TRUCK_MODEL_LINES: TruckModelLine[] = [
  {
    brandName: "Bridgestone",
    modelName: "R268",
    positioning: "premium",
    sizes: [
      { width: 275, aspectRatio: 80, rim: 22.5, loadIndex: "149/146", speedIndex: "L", confirmed: true, price: 2300 },
      { width: 295, aspectRatio: 80, rim: 22.5, loadIndex: "152/148", speedIndex: "M", confirmed: true, price: 2600 },
    ],
    evidence:
      "Confirmado em múltiplos varejistas (PneuStore, Rodomag, Roda Viva Pneus): R268 275/80R22.5 índice 149/146L e 295/80R22.5 índice 152/148M — pneu para eixos direcionais/livres/tração moderada em rodovia.",
  },
  {
    brandName: "Michelin",
    modelName: "X Multi Z",
    positioning: "premium",
    sizes: [
      { width: 275, aspectRatio: 80, rim: 22.5, loadIndex: "149/146", speedIndex: "L", confirmed: true, price: 2350 },
      { width: 295, aspectRatio: 80, rim: 22.5, loadIndex: "152/148", speedIndex: "M", confirmed: false, price: 2650 },
    ],
    evidence:
      "Catálogo oficial (pro.michelin.com.br) e varejistas (CargaPesada Pneus, GSRD Pneus) confirmam X Multi Z em 275/80R22.5 (149/146L) e 295/80R22.5. Índice da medida 295/80R22.5 não teve fonte específica para o Michelin — usado o índice padrão da medida (mesmo valor confirmado para outras marcas nessa medida).",
  },
  {
    brandName: "Firestone",
    modelName: "FS403 Classic",
    positioning: "economy",
    sizes: [
      { width: 275, aspectRatio: 80, rim: 22.5, loadIndex: "149/146", speedIndex: "L", confirmed: true, price: 1800 },
      { width: 295, aspectRatio: 80, rim: 22.5, loadIndex: "152/148", speedIndex: "M", confirmed: false, price: 2050 },
    ],
    evidence:
      "Varejistas (Della Via Pneus, Grupo Tala, MGA Pneus) confirmam FS403 Classic em 275/80R22.5 (149/146L) e citam disponibilidade em 295/80R22.5 sem o índice específico confirmado — usado o índice padrão da medida.",
  },
  {
    brandName: "Goodyear",
    modelName: "KMax D Traction",
    positioning: "premium",
    sizes: [
      { width: 275, aspectRatio: 80, rim: 22.5, loadIndex: "149/146", speedIndex: "L", confirmed: true, price: 2350 },
      { width: 295, aspectRatio: 80, rim: 22.5, loadIndex: "152/148", speedIndex: "L", confirmed: false, price: 2650 },
    ],
    evidence:
      "Confirmado em varejista brasileiro (hcpneus.com.br): KMax D Traction 275/80R22.5 149/146L 16PR, pneu de tração para eixo motriz. Medida 295/80R22.5 encontrada apenas em catálogos regionais Goodyear (México/Colômbia), não em varejista brasileiro específico — usado o mesmo índice 152/148L.",
  },
  {
    brandName: "Continental",
    modelName: "HDC1+",
    positioning: "economy",
    sizes: [
      { width: 275, aspectRatio: 80, rim: 22.5, loadIndex: "149/146", speedIndex: "K", confirmed: true, price: 1800 },
    ],
    evidence:
      "Confirmado em múltiplos varejistas brasileiros (Carrefour, Grupo Tala, Hipervarejo): HDC1+ 275/80R22.5 149/146K, banda mista/borrachuda para uso misto rodovia-terra (obras, mineração).",
  },
  {
    brandName: "Continental",
    modelName: "HTR1",
    positioning: "premium",
    sizes: [
      { width: 295, aspectRatio: 80, rim: 22.5, loadIndex: "152/148", speedIndex: "M", confirmed: true, price: 2650 },
    ],
    evidence:
      "Confirmado em múltiplos varejistas brasileiros (Grupo Tala, Cantu Pneus, Hipervarejo): HTR1 295/80R22.5 152/148M, banda lisa rodoviária para longa distância, compatível com Volvo/Scania/Mercedes-Benz.",
  },
  {
    brandName: "Pirelli",
    modelName: "FG85",
    positioning: "premium",
    sizes: [
      { width: 275, aspectRatio: 80, rim: 22.5, loadIndex: "149/146", speedIndex: "L", confirmed: true, price: 2300 },
      { width: 295, aspectRatio: 80, rim: 22.5, loadIndex: "152/148", speedIndex: "L", confirmed: false, price: 2600 },
    ],
    evidence:
      "Confirmado em varejista brasileiro (PneuStore): FG85 275/80R22.5 149/146L, pneu misto para eixo direcional/livre (obras, mineração, transporte agrícola). Medida 295/80R22.5 encontrada em catálogos regionais (Chile/Venezuela), não em varejista brasileiro específico — usado o mesmo índice 152/148L.",
  },
];
