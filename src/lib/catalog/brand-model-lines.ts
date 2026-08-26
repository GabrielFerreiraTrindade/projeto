// Linhas de produto (modelos) usadas por marca, no máximo 2 por marca em
// todo o catálogo. Cada nome de linha é um produto real, publicamente
// documentado, comprado como referência de nomenclatura (site do
// fabricante, distribuidor ou grande varejista) — nunca inventado.
//
// minRim/maxRim: faixa de aro em que a linha REALMENTE é fabricada, segundo
// pesquisa (catálogo do fabricante, grandes varejistas). O gerador de
// catálogo (catalog-generator.ts) só cria produto para uma medida se o aro
// dela estiver dentro dessa faixa — corrige o problema encontrado antes
// (todo modelo estava sendo aplicado a todas as 23 medidas pesquisadas,
// mesmo em aros onde a linha não existe de verdade). Quando a faixa
// encontrada é estreita ou a fonte é fraca, a faixa usada aqui fica no lado
// conservador (não estende além do que foi encontrado).
export type BrandModelLine = {
  name: string;
  /** Posicionamento comercial observado (não é um dado de vendas). */
  positioning: "economy" | "premium";
  minRim: number;
  maxRim: number;
  evidence: string;
};

export const BRAND_MODEL_LINES: Record<string, [BrandModelLine, BrandModelLine]> = {
  Pirelli: [
    {
      name: "Cinturato P1",
      positioning: "economy",
      minRim: 14,
      maxRim: 16,
      evidence:
        "Fabricante e varejistas (pneus.org, griffepneus, fullpneus) listam Cinturato P1 apenas em aro 14 a 16 (175/65R14, 175/70R14, 185/70R14, 185/60R15, 185/65R15, 195/60R15, 195/65R15, 205/65R15, 195/55R16, 195/60R16). A variante 'Plus' vai a aro 17/18, mas essa variante não faz parte deste catálogo.",
    },
    {
      name: "Scorpion Verde",
      positioning: "premium",
      minRim: 16,
      maxRim: 22,
      evidence:
        "Catálogo oficial Pirelli (pirelli.com) e revendedores confirmam Scorpion Verde em aro 16 a 22 (215/65R17, 235/50R18, 255/55R18, etc.) — linha para SUV/picape, nunca em aros pequenos de carro compacto.",
    },
  ],
  Bridgestone: [
    {
      name: "Turanza",
      positioning: "premium",
      minRim: 16,
      maxRim: 22,
      evidence:
        "Bridgestone Brasil descreve as linhas Turanza (T005, Turanza 6, linha SUV/picape) cobrindo aro 16 a 22, para veículos premium/SUV (Corolla, HR-V, Kicks, Hilux, SW4, Toro, S10) — não fabricada para aros de carro popular (13-15).",
    },
    {
      name: "Ecopia",
      positioning: "economy",
      minRim: 15,
      maxRim: 16,
      evidence:
        "Medidas confirmadas do Ecopia EP150 no Brasil: 185/60R15, 185/65R15, 195/55R16, 205/55R16 (bridgestone.com.br, varejistas). Sem evidência de aro 14 ou acima de 16 para esta linha.",
    },
  ],
  Goodyear: [
    {
      name: "Assurance",
      positioning: "premium",
      minRim: 14,
      maxRim: 16,
      evidence:
        "Fontes de varejo brasileiras (loja.goodyear.com.br, 1stpneus) mostram Assurance/Assurance MaxLife concentrada em aro 13-14 (175/65R14, 175/70R14, 185/65R14, 185/70R14); mantido até aro 16 de forma conservadora por ser uma linha touring ampla, sem evidência de aros maiores no Brasil.",
    },
    {
      name: "EfficientGrip Performance",
      positioning: "economy",
      minRim: 14,
      maxRim: 17,
      evidence:
        "Página oficial goodyear.com.br confirma 'nove medidas diferentes, do aro 14 ao aro 17' para o EfficientGrip Performance (175/70, 185/55, 185/60, 195/55, 195/65, 225/45R17, etc.).",
    },
  ],
  Michelin: [
    {
      name: "Primacy 4",
      positioning: "premium",
      minRim: 15,
      maxRim: 19,
      evidence:
        "Catálogo oficial e varejistas (michelin.com.br, pneusm.com.br) mostram Primacy 4 de aro 15 a 19 (195/55R16, 205/55R16, 215/50R17, 225/45R17, 235/50R18) — linha para sedãs médios/SUVs, não para aro 14.",
    },
    {
      name: "Energy XM2+",
      positioning: "economy",
      minRim: 14,
      maxRim: 16,
      evidence:
        "Loja oficial (michelin.pneufree.com.br) e varejistas confirmam Energy XM2+ de aro 14 a 16 (175/65R14, 175/70R14, 185/60R14, 185/70R14, 195/60R14, 185/65R15, 195/55R15, 195/60R15) — linha de entrada para carros populares.",
    },
  ],
  Continental: [
    {
      name: "PowerContact 2",
      positioning: "economy",
      minRim: 14,
      maxRim: 16,
      evidence:
        "Descrita como 'a linha mais vendida da marca no Brasil' pelo blog do distribuidor Pneuscarmg. Reportagem sobre o lançamento confirma '14 opções de medida, cobrindo aros de 13 a 16' — não fabricada em aros maiores.",
    },
    {
      name: "UltraContact",
      positioning: "premium",
      minRim: 14,
      maxRim: 19,
      evidence:
        "Lançamento noticiado (omecanico.com.br, autopapo.com.br): 'disponível inicialmente em 18 medidas, cobrindo aros de 14 a 19'.",
    },
  ],
  Yokohama: [
    {
      name: "BluEarth-ES ES32",
      positioning: "premium",
      minRim: 14,
      maxRim: 16,
      evidence:
        "Varejistas brasileiros (dagostinpneus, pneustyres) confirmam BluEarth-ES ES32 em aro 14, 15 e 16 (175/65R14, 185/60R15, 195/60R15, 195/60R16) — sem evidência de aros maiores no Brasil.",
    },
    {
      name: "Ecos ES31",
      positioning: "economy",
      minRim: 14,
      maxRim: 18,
      evidence:
        "Catálogo oficial global da Yokohama (y-yokohama.com) lista Ecos ES31 de 145/80R13 a 225/45R18 (aro 13 a 18) — linha padrão de baixo consumo com ampla cobertura de aros.",
    },
  ],
  Dunlop: [
    {
      name: "SP Touring R1",
      positioning: "economy",
      minRim: 14,
      maxRim: 15,
      evidence:
        "Lançamento oficial (ANIP, omecanico.com.br) e varejistas confirmam SP Touring R1 em aro 13 a 15 apenas (165/70R13, 175/70R13, 175/65R14, 175/70R14), 'total de 8 medidas' — linha específica para carros populares compactos.",
    },
    {
      name: "SP Sport Maxx 060+",
      positioning: "premium",
      minRim: 17,
      maxRim: 20,
      evidence:
        "Loja oficial (dunloppneus.com.br) vende SP Sport Maxx 060+ apenas em aro 17 a 20 (215/55R17, 255/35R18, 245/45R20, 265/50R20) — linha esportiva/premium para rodas grandes.",
    },
  ],
  Firestone: [
    {
      name: "F-600",
      positioning: "economy",
      minRim: 14,
      maxRim: 16,
      evidence:
        "Fontes de varejo confirmam F-600 'disponível em uma ampla variedade de tamanhos, de aro 14 a 16' (175/65R14, 195/60R15, 195/65R15, 205/55R16).",
    },
    {
      name: "Multihawk 2",
      positioning: "premium",
      minRim: 14,
      maxRim: 16,
      evidence:
        "Varejistas confirmam Multihawk/Multihawk 2 em aro 13 a 14 (165/70R13, 175/70R13, 175/70R14); mantido até aro 16 de forma conservadora por ser a linha principal da marca para 'carros populares' segundo a Automotive Business, sem evidência de aros maiores.",
    },
  ],
  Hankook: [
    {
      name: "Kinergy GT H436",
      positioning: "premium",
      minRim: 14,
      maxRim: 22,
      evidence:
        "Catálogo oficial Hankook Brasil (hankooktire.com/br) mostra Kinergy GT H436 com medidas de aro 13 a 22, com forte concentração entre aro 15 e 19 — linha touring de cobertura ampla.",
    },
    {
      name: "Optimo H724",
      positioning: "economy",
      minRim: 14,
      maxRim: 17,
      evidence:
        "Varejistas e catálogo oficial confirmam Optimo H724 'disponível em 12 medidas, que variam do aro 13 ao 17' (175/65R14, 175/70R14, 185/60R14, 185/70R14, 195/60R15, 205/60R15).",
    },
  ],
  Xbri: [
    {
      name: "Ecology",
      positioning: "economy",
      minRim: 14,
      maxRim: 17,
      evidence:
        "Loja oficial (xbri.com.br) e varejistas confirmam Ecology em aro 13 a 17 (165/60R14, 175/65R14, 175/65R15, 195/55R15, 195/60R15, 205/55R16, 235/60R16, 205/50R17, 215/55R17).",
    },
    {
      name: "Sport Plus 2",
      positioning: "premium",
      minRim: 16,
      maxRim: 20,
      evidence:
        "Loja oficial (xbri.com.br) vende Sport Plus 2 apenas em aro 16 a 20, perfis baixos/esportivos (205/50R16, 225/55R17, 235/50R18, 245/45R19, 205/35R20) — nunca em aros de carro popular pequeno.",
    },
  ],
  Westlake: [
    {
      name: "RP28",
      positioning: "economy",
      minRim: 14,
      maxRim: 16,
      evidence:
        "Catálogo oficial (westlakepneus.com.br) lista o RP28 de aro 13 a 16 (175/70R14, 185/65R15, 195/60R15, 205/55R16, entre outras) — linha de entrada para carro de passeio, sem evidência de aro maior.",
    },
    {
      name: "SU318",
      positioning: "premium",
      minRim: 15,
      maxRim: 20,
      evidence:
        "Catálogo oficial (westlakepneus.com.br) lista o SU318 de aro 15 a 20 (225/65R17, 235/60R18, 255/55R19, 275/55R20, entre outras) — linha SUV/LTR premium 'para aplicação em estradas pavimentadas', não fabricada em aros de carro popular pequeno.",
    },
  ],
};
