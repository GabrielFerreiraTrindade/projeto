// Preço "quebrado" (ex: R$ 99,90 em vez de R$ 100,00) — padrão de varejo
// usado por praticamente todo e-commerce brasileiro. Aplicado a todo preço
// final do catálogo (price e compareAtPrice), nunca um valor "cheio".
export function toCharmPrice(value: number): number {
  return Math.round((Math.round(value) - 0.1) * 100) / 100;
}
