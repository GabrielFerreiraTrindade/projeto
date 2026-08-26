import { describe, expect, it } from "vitest";

import { clampQuantity, computeCartSummary } from "@/lib/cart/cart-calculations";
import { makeTestTire } from "@/lib/test-utils/test-fixtures";
import type { CartLine } from "@/types/cart";

// Cenário 3 do item 17: "calcular total".
describe("computeCartSummary", () => {
  it("soma subtotal, aplica desconto de promoção e adiciona o frete", () => {
    const lines: CartLine[] = [
      {
        productId: "a",
        quantity: 2,
        product: makeTestTire({ id: "a", price: 100, compareAtPrice: 150 }),
      },
      {
        productId: "b",
        quantity: 1,
        product: makeTestTire({ id: "b", price: 50 }),
      },
    ];

    const summary = computeCartSummary(lines, 20);

    expect(summary.itemCount).toBe(3);
    expect(summary.subtotal).toBe(2 * 150 + 50); // 350: usa o preço "de tabela" para o subtotal
    expect(summary.discount).toBe(2 * (150 - 100)); // 100: desconto do item em oferta
    expect(summary.total).toBe(350 - 100 + 20); // 270
  });

  it("sem frete calculado ainda, o total não soma nada de frete", () => {
    const lines: CartLine[] = [
      { productId: "a", quantity: 1, product: makeTestTire({ price: 100 }) },
    ];

    const summary = computeCartSummary(lines, null);

    expect(summary.shippingPrice).toBeNull();
    expect(summary.total).toBe(100);
  });

  it("carrinho vazio soma zero em tudo", () => {
    const summary = computeCartSummary([], null);
    expect(summary).toMatchObject({ itemCount: 0, subtotal: 0, discount: 0, total: 0 });
  });
});

describe("clampQuantity", () => {
  it("nunca deixa a quantidade sair do intervalo permitido", () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(-5)).toBe(1);
    expect(clampQuantity(5)).toBe(5);
    expect(clampQuantity(999)).toBe(10);
  });
});
