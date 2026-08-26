import type { CartState } from "@/types/cart";

// Persistência do carrinho no navegador (localStorage), para o carrinho
// sobreviver a um refresh de página sem exigir login. Quando houver conta de
// usuário e backend, troque esta camada por uma sincronização com o
// model Cart/CartItem do Prisma, mantendo a mesma assinatura.

const CART_STORAGE_KEY = "pneuminas:cart";

const EMPTY_STATE: CartState = { lines: [], shippingCep: null };

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadCartState(): CartState {
  if (!isBrowser()) return EMPTY_STATE;

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return EMPTY_STATE;

    const parsed = JSON.parse(raw) as Partial<CartState>;
    return {
      lines: Array.isArray(parsed.lines) ? parsed.lines : [],
      shippingCep: parsed.shippingCep ?? null,
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveCartState(state: CartState): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Armazenamento indisponível (modo privado, quota excedida etc.):
    // o carrinho continua funcionando na sessão atual, só não persiste.
  }
}
