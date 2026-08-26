import { prisma } from "@/lib/prisma";

export type SizeCombination = {
  width: number;
  aspectRatio: number;
  rimDiameter: number;
};

// Combinações de medida realmente existentes no catálogo (produto ativo) —
// usadas para tornar o buscador por medida da home "inteligente": depois
// que a largura é escolhida, só aparecem os perfis que de fato existem
// para ela; depois do perfil, só os aros que de fato existem para aquela
// largura+perfil. Antes da largura ser escolhida, a busca continua
// aceitando qualquer combinação (não restringe a lista completa).
//
// Só medidas de carro/SUV (com perfil) — o buscador da home é
// especificamente "Largura/Perfil/Aro", formato que não existe em pneu
// comercial de van (ex: "185 R14", sem perfil). Van/moto/caminhão são
// buscados pelas páginas de categoria, não por este widget.
export async function getAvailableSizeCombinations(): Promise<SizeCombination[]> {
  const sizes = await prisma.tireSize.findMany({
    where: { products: { some: { isActive: true } }, aspectRatio: { not: null } },
    select: { width: true, aspectRatio: true, rimDiameter: true },
  });
  return sizes.map((size) => ({ ...size, aspectRatio: size.aspectRatio! }));
}
