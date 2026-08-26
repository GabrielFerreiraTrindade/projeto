import { tiresCatalog } from "@/lib/data/tires-catalog";
import type { Tire } from "@/types/catalog";

// O carrinho guarda apenas productId + quantidade e resolve os dados do
// produto (preço, disponibilidade, frete) a partir do catálogo sempre que
// exibe algo — nunca "congela" um preço antigo no carrinho.
//
// Hoje isso é uma busca síncrona em memória porque o catálogo inteiro já
// está disponível no cliente. Quando o catálogo vier de uma API/banco real,
// troque esta função por uma chamada (ex: GET /api/products?ids=...) e
// resolva os itens do carrinho de forma assíncrona — o restante do carrinho
// não precisa mudar.
export function resolveTireById(productId: string): Tire | undefined {
  return tiresCatalog.find((tire) => tire.id === productId);
}
