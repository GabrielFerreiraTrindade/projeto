"use client";

import { useEffect, useRef } from "react";

import { useCart } from "@/lib/cart/cart-context";

// Esvazia o carrinho assim que a página de sucesso do pedido é exibida —
// só é alcançada depois que o pedido foi criado de verdade no servidor.
export function ClearCartOnMount() {
  const { clearCart } = useCart();
  const didClear = useRef(false);

  useEffect(() => {
    if (didClear.current) return;
    didClear.current = true;
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roda uma única vez ao montar.
  }, []);

  return null;
}
