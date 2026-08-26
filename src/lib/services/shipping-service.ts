// Serviço de frete. Hoje calcula uma estimativa simulada e determinística a
// partir do CEP (sem integração real com transportadora). Quando houver uma
// integração real (Correios/transportadora), troque a implementação desta
// função mantendo a mesma assinatura — nada que a consome precisa mudar.

export type ShippingEstimate = {
  cep: string;
  days: number;
  price: number;
};

export function isValidCep(cep: string): boolean {
  return cep.replace(/\D/g, "").length === 8;
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

// Regiões do CEP seguem a numeração oficial dos Correios: o primeiro dígito
// define a macrorregião. 0 e 1 = São Paulo, 2 = Rio de Janeiro e Espírito
// Santo, 3 = Minas Gerais — juntos, os quatro estados do Sudeste (faixa
// 01000-000 a 39999-999).
export function isSoutheastCep(cep: string): boolean {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return false;
  return digits[0] <= "3";
}

// Frete grátis automático: R$400 pro Sudeste (SP/RJ/ES/MG), R$1.500 pro
// resto do Brasil — regra de negócio pedida explicitamente pelo dono da
// loja.
export const FREE_SHIPPING_THRESHOLD_SOUTHEAST = 400;
export const FREE_SHIPPING_THRESHOLD_BRAZIL = 1500;

export function getFreeShippingThreshold(cep: string): number {
  return isSoutheastCep(cep)
    ? FREE_SHIPPING_THRESHOLD_SOUTHEAST
    : FREE_SHIPPING_THRESHOLD_BRAZIL;
}

/** Estimativa de frete para um valor de compra (um produto ou o carrinho todo). */
export function estimateShipping(cep: string, amount: number): ShippingEstimate {
  const digits = cep.replace(/\D/g, "");
  const digitSum = digits
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0);
  const days = 3 + (digitSum % 6);
  const freeShipping = amount >= getFreeShippingThreshold(cep);
  const price = freeShipping ? 0 : 19.9 + (digitSum % 4) * 5;
  return { cep: digits, days, price };
}

/** Estimativa de frete para o carrinho, a partir do valor total dos produtos (já com desconto). */
export function estimateCartShipping(cep: string, cartTotal: number): ShippingEstimate {
  return estimateShipping(cep, cartTotal);
}

export type ShippingOption = {
  method: string;
  carrier: string;
  days: number;
  price: number;
};

/** Modalidades de entrega mostradas no checkout (PAC/Sedex). */
export function estimateShippingOptions(cep: string, cartTotal: number): ShippingOption[] {
  const base = estimateCartShipping(cep, cartTotal);

  return [
    {
      method: "PAC",
      carrier: "Correios",
      days: base.days + 2,
      price: base.price,
    },
    {
      method: "SEDEX",
      carrier: "Correios",
      days: Math.max(1, base.days - 2),
      price: base.price + 15,
    },
  ];
}
