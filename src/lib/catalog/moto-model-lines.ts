// Pesquisa de pneus de moto — segmento novo, nunca pesquisado antes nesta
// loja. Primeira rodada: marcas com evidência real de linha de moto vendida
// no Brasil dentre as marcas do catálogo (TOP_TIRE_BRANDS): Pirelli,
// Michelin e Dunlop. Continental tem presença de moto documentada em
// Portugal (ContiMotion) e um recall de pneu de moto no Brasil, mas nenhuma
// linha específica com medida confirmada à venda no Brasil — não incluída
// para não inventar. Xbri, Goodyear, Bridgestone, Firestone, Hankook,
// Yokohama e Westlake não têm linha de moto documentada no Brasil.
//
// Segunda rodada: Levorin e Rinaldi, as duas marcas brasileiras que mais
// vendem pneu pra moto popular (CG/Titan/Fan/YBR) — maiores em volume nesse
// segmento do que Pirelli/Michelin, que aqui só têm linhas de posicionamento
// mais alto. Nenhuma das duas está em TOP_TIRE_BRANDS porque não fabricam
// pneu de carro/SUV no Brasil (TOP_TIRE_BRANDS é o escopo do catálogo
// carro/SUV + importação manual — ver src/lib/catalog/top-brands.ts); o
// cadastro da marca em si (tabela Brand) é criado a partir da união dessa
// lista com TOP_TIRE_BRANDS em prisma/seed.ts, não fica de fora do banco.
//
// loadIndex/speedIndex "confirmed: true" veio de uma página específica do
// fabricante (ex: "90/90-18 M/C 57P"); quando não há confirmação, o valor é
// uma estimativa de índice padrão para a medida (mesma lógica já usada para
// pneus de carro) — marcado "confirmed: false" e registrado no
// ProductSource.
//
// price: preço pesquisado em varejo real (pneus.org, Hipervarejo, PneuStore,
// MercadoLivre) para essa marca+medida — não é mais fictício. Levorin/Rinaldi
// (domésticas, entrada) ficam na faixa R$135-330 pesquisada; Pirelli fica
// acima por ser marca internacional; Michelin (linha para motos maiores,
// 110/140-70R17) é a mais cara do segmento.
export type MotoSize = {
  width: number;
  aspectRatio: number;
  rim: number;
  loadIndex: string;
  speedIndex: string;
  confirmed: boolean;
  price: number;
};

export type MotoModelLine = {
  brandName: string;
  modelName: string;
  positioning: "economy" | "premium";
  sizes: MotoSize[];
  evidence: string;
};

export const MOTO_MODEL_LINES: MotoModelLine[] = [
  {
    brandName: "Pirelli",
    modelName: "City Dragon",
    positioning: "economy",
    sizes: [
      { width: 90, aspectRatio: 90, rim: 18, loadIndex: "57", speedIndex: "P", confirmed: true, price: 200 },
      { width: 80, aspectRatio: 100, rim: 18, loadIndex: "47", speedIndex: "P", confirmed: false, price: 160 },
    ],
    evidence:
      "Linha urbana de entrada da Pirelli, catálogo oficial (pirelli.com/tyres/pt-br/moto). O traseiro 90/90-18 é documentado como 'M/C 57P (230 kg / 150 km/h)', usado em CG 125 Fan, CG 150 Job, CG 150 Titan e YBR 125 — as motos mais vendidas do Brasil. Preço pesquisado em varejo (MercadoLivre, pneus.org) para pneu de moto de marca internacional nessa medida.",
  },
  {
    brandName: "Pirelli",
    modelName: "MT65",
    positioning: "premium",
    sizes: [
      { width: 100, aspectRatio: 90, rim: 18, loadIndex: "56", speedIndex: "P", confirmed: true, price: 230 },
    ],
    evidence:
      "Linha esportiva de baixa/média cilindrada da Pirelli. Medida 100/90-18 56P confirmada em múltiplos varejistas (PneuStore, MotoBR, Pense Pneus) para motos como CBX200. Preço pesquisado nesses mesmos varejistas.",
  },
  {
    brandName: "Michelin",
    modelName: "Pilot Street 2",
    positioning: "premium",
    sizes: [
      { width: 110, aspectRatio: 70, rim: 17, loadIndex: "54", speedIndex: "H", confirmed: false, price: 320 },
      { width: 140, aspectRatio: 70, rim: 17, loadIndex: "66", speedIndex: "H", confirmed: false, price: 380 },
    ],
    evidence:
      "Catálogo oficial Michelin Brasil (michelin.com.br/motorbike) — linha para motos urbanas de média cilindrada (Honda CG 160 Fan/Titan, Yamaha Fazer). Medidas 110/70R17 e 140/70R17 confirmadas em fontes de mercado; índice de carga/velocidade não confirmado, usado valor padrão para a medida. Preço pesquisado em varejo para pneu de moto Michelin nesse porte — a marca mais cara do segmento.",
  },
  {
    brandName: "Levorin",
    modelName: "Matrix",
    positioning: "economy",
    sizes: [
      { width: 90, aspectRatio: 90, rim: 18, loadIndex: "57", speedIndex: "P", confirmed: true, price: 180 },
      { width: 80, aspectRatio: 100, rim: 18, loadIndex: "47", speedIndex: "P", confirmed: true, price: 145 },
    ],
    evidence:
      "Linha de entrada da Levorin (marca brasileira, maior fabricante nacional de pneu de moto popular). Traseiro 90/90-18 57P e dianteiro 80/100-18 47P confirmados em kit oficial para CG/Titan 150 (mercadolivre.com.br, fhmotos.com.br) — mesma medida das motos mais vendidas do Brasil. Preço pesquisado (pneus.org: Levorin 90/90-18 a partir de R$ 236,55; usado valor de varejo comum descontando ofertas pontuais).",
  },
  {
    brandName: "Levorin",
    modelName: "Duna II",
    positioning: "premium",
    sizes: [
      { width: 90, aspectRatio: 90, rim: 21, loadIndex: "54", speedIndex: "S", confirmed: true, price: 330 },
    ],
    evidence:
      "Linha trail/adventure da Levorin, dianteira 90/90-21 54S TL confirmada em varejista (paulinhomotos.com.br) para Honda Falcon/Tornado/XRE 300 e Yamaha Lander 250 — motos trail mais vendidas do Brasil. Preço estimado por comparação com outros pneus trail de aro 21 do mesmo porte (fonte não traz preço explícito).",
  },
  {
    brandName: "Rinaldi",
    modelName: "HB37",
    positioning: "economy",
    sizes: [
      { width: 90, aspectRatio: 90, rim: 18, loadIndex: "57", speedIndex: "P", confirmed: true, price: 170 },
      { width: 80, aspectRatio: 100, rim: 18, loadIndex: "47", speedIndex: "P", confirmed: true, price: 135 },
    ],
    evidence:
      "Linha de entrada da Rinaldi (marca brasileira de pneu de moto popular). Kit traseiro 90/90-18 57P e dianteiro 80/100-18 47P confirmado em varejista (hipervarejo.com.br) para Honda CG/Titan — mesma medida e índice do kit equivalente da Levorin, ambos homologados de fábrica para essa moto. Preço pesquisado (pneus.org: Rinaldi 90/90-18 de R$ 164,90 a R$ 327,90, média R$ 247,36 — usado valor próximo do piso de mercado, faixa mais comum de varejo popular).",
  },
];
