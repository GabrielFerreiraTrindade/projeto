import type { Tire } from "@/types/catalog";

// Linha do carrinho como é persistida (localStorage): só o essencial. O
// preço e os dados do produto são sempre resolvidos a partir do catálogo no
// momento da exibição, nunca "congelados" no carrinho.
export type CartLineState = {
  productId: string;
  quantity: number;
};

// Linha do carrinho já resolvida com os dados do produto, pronta para a UI.
export type CartLine = CartLineState & {
  product: Tire;
};

export type CartState = {
  lines: CartLineState[];
  // Só o CEP é persistido; a estimativa de frete (dias/preço) é sempre
  // recalculada a partir da composição atual do carrinho, nunca "congelada".
  shippingCep: string | null;
};

// Espaço reservado para o desconto de cupom entrar futuramente sem mudar a
// forma do restante do resumo.
export type CartSummary = {
  itemCount: number;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  shippingPrice: number | null;
  total: number;
};
