import type { CartLine, CartSummary } from "@/types/cart";

export const MIN_LINE_QUANTITY = 1;
export const MAX_LINE_QUANTITY = 10;

export function clampQuantity(quantity: number): number {
  return Math.min(MAX_LINE_QUANTITY, Math.max(MIN_LINE_QUANTITY, quantity));
}

// Valor efetivamente pago pelos produtos (já com desconto), usado para
// decidir a faixa de frete grátis antes do frete em si estar calculado
// (subtotal - desconto do computeCartSummary, mas sem depender dele).
export function computeProductsTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
}

// Resumo do carrinho. `couponDiscount` fica pronto para receber o valor de
// um cupom aplicado no futuro — hoje é sempre 0, sem UI para aplicar cupom.
export function computeCartSummary(
  lines: CartLine[],
  shippingPrice: number | null,
): CartSummary {
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  const subtotal = lines.reduce((sum, line) => {
    const unitPrice = line.product.compareAtPrice ?? line.product.price;
    return sum + unitPrice * line.quantity;
  }, 0);

  const discount = lines.reduce((sum, line) => {
    if (!line.product.compareAtPrice) return sum;
    return (
      sum + (line.product.compareAtPrice - line.product.price) * line.quantity
    );
  }, 0);

  const couponDiscount = 0;

  const total = subtotal - discount - couponDiscount + (shippingPrice ?? 0);

  return {
    itemCount,
    subtotal,
    discount,
    couponDiscount,
    shippingPrice,
    total,
  };
}
