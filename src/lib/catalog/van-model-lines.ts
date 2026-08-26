// Pneus comerciais de van/utilitário (ex: Kombi, furgões leves) — medida
// sem número de perfil (ex: "185R14C", onde "C" = reforçado/comercial),
// diferente do formato largura/perfil/aro dos pneus de carro. Só a Xbri
// tem linha documentada nessa categoria dentre as marcas do catálogo —
// as outras não vendem pneu de van no Brasil segundo a pesquisa feita.
//
// price: nenhum varejista pesquisado (Xbri oficial, PneuBest, Pneuar,
// Atacadão) expôs o preço em texto indexável na busca — valor estimado por
// ordem de grandeza de pneu comercial 8 lonas reforçado nessa medida
// (tipicamente acima do pneu de passeio equivalente pelo reforço de
// carcaça), não uma cotação confirmada.
export type VanSize = {
  width: number;
  rim: number;
  loadIndex: string;
  speedIndex: string;
  price: number;
};

export type VanModelLine = {
  brandName: string;
  modelName: string;
  positioning: "economy" | "premium";
  sizes: VanSize[];
  evidence: string;
};

export const VAN_MODEL_LINES: VanModelLine[] = [
  {
    brandName: "Xbri",
    modelName: "Forza Van F1",
    positioning: "economy",
    sizes: [
      { width: 185, rim: 14, loadIndex: "102/100", speedIndex: "R", price: 480 },
      { width: 195, rim: 14, loadIndex: "106/104", speedIndex: "R", price: 530 },
    ],
    evidence:
      "Loja oficial (xbri.com.br) e varejistas (Pneubest) confirmam Forza Van F1 em 185R14C 8 Lonas 102/100R e 195R14C 8 Lonas 106/104R — medida padrão de Kombi e furgões leves.",
  },
  {
    brandName: "Xbri",
    modelName: "Cargoplus",
    positioning: "premium",
    sizes: [
      { width: 185, rim: 14, loadIndex: "102/100", speedIndex: "R", price: 560 },
      { width: 195, rim: 14, loadIndex: "106/104", speedIndex: "R", price: 610 },
      { width: 205, rim: 14, loadIndex: "109/107", speedIndex: "R", price: 680 },
    ],
    evidence:
      "Loja oficial (xbri.com.br/modelos/cargoplus) e varejistas (Pneufree, Veloce Pneus) confirmam Cargoplus em 185R14C, 195R14C e 205R14C, todos 8 lonas — linha de carga mais reforçada que a Forza Van F1.",
  },
];
