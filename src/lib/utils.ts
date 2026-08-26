import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combina classes condicionais (clsx) e resolve conflitos de utilitários Tailwind (twMerge).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}
