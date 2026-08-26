"use client";

import { createContext, useContext, useEffect, useState } from "react";

import {
  MAX_LINE_QUANTITY,
  MIN_LINE_QUANTITY,
  clampQuantity,
  computeCartSummary,
  computeProductsTotal,
} from "@/lib/cart/cart-calculations";
import { resolveTireById } from "@/lib/cart/resolve-products";
import { loadCartState, saveCartState } from "@/lib/cart/storage";
import {
  estimateCartShipping,
  isValidCep,
  type ShippingEstimate,
} from "@/lib/services/shipping-service";
import type { CartLine, CartLineState, CartSummary } from "@/types/cart";

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  summary: CartSummary;
  shipping: ShippingEstimate | null;
  isHydrated: boolean;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateShipping: (cep: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lineStates, setLineStates] = useState<CartLineState[]>([]);
  const [shippingCep, setShippingCep] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hidrata a partir do localStorage depois da primeira renderização, para
  // o HTML do servidor e do cliente combinarem (evita erro de hidratação).
  useEffect(() => {
    const state = loadCartState();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage só existe no cliente; precisa rodar após o mount, uma única vez.
    setLineStates(state.lines);
    setShippingCep(state.shippingCep);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveCartState({ lines: lineStates, shippingCep });
  }, [lineStates, shippingCep, isHydrated]);

  const lines: CartLine[] = lineStates
    .map((state) => {
      const product = resolveTireById(state.productId);
      return product ? { ...state, product } : null;
    })
    .filter((line): line is CartLine => line !== null);

  // O frete nunca fica "congelado": é sempre recalculado a partir do CEP
  // salvo e do valor atual do carrinho (ex: adicionar mais um item pode
  // levar o carrinho a bater o valor mínimo de frete grátis).
  const shipping = shippingCep
    ? estimateCartShipping(shippingCep, computeProductsTotal(lines))
    : null;

  const summary = computeCartSummary(lines, shipping?.price ?? null);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  function addItem(productId: string, quantity = 1) {
    setLineStates((prev) => {
      const existing = prev.find((line) => line.productId === productId);
      if (existing) {
        return prev.map((line) =>
          line.productId === productId
            ? { ...line, quantity: clampQuantity(line.quantity + quantity) }
            : line,
        );
      }
      return [...prev, { productId, quantity: clampQuantity(quantity) }];
    });
  }

  function removeItem(productId: string) {
    setLineStates((prev) =>
      prev.filter((line) => line.productId !== productId),
    );
  }

  function increaseQuantity(productId: string) {
    setLineStates((prev) =>
      prev.map((line) =>
        line.productId === productId
          ? { ...line, quantity: clampQuantity(line.quantity + 1) }
          : line,
      ),
    );
  }

  function decreaseQuantity(productId: string) {
    setLineStates((prev) =>
      prev.map((line) =>
        line.productId === productId
          ? { ...line, quantity: clampQuantity(line.quantity - 1) }
          : line,
      ),
    );
  }

  function setQuantity(productId: string, quantity: number) {
    setLineStates((prev) =>
      prev.map((line) =>
        line.productId === productId
          ? { ...line, quantity: clampQuantity(quantity) }
          : line,
      ),
    );
  }

  function clearCart() {
    setLineStates([]);
    setShippingCep(null);
  }

  function calculateShipping(cep: string): boolean {
    if (!isValidCep(cep)) return false;
    setShippingCep(cep.replace(/\D/g, ""));
    return true;
  }

  return (
    <CartContext.Provider
      value={{
        lines,
        itemCount,
        summary,
        shipping,
        isHydrated,
        addItem,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        setQuantity,
        clearCart,
        calculateShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart precisa ser usado dentro de <CartProvider>.");
  }
  return context;
}

export { MAX_LINE_QUANTITY, MIN_LINE_QUANTITY };
