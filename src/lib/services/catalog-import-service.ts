import { prisma } from "@/lib/prisma";
import { parseImportFile } from "@/lib/catalog/import/parsers";
import { validateImportRows } from "@/lib/catalog/import/validate";
import type { ImportFormat, ImportReport, ImportRowResult } from "@/lib/catalog/import/types";

// Serviço de importação (/admin/importar-produtos): previewImport nunca
// grava nada — só faz o parse + validação e devolve o relatório para o
// admin revisar antes de confirmar (seção 12: pré-visualização, validação,
// duplicidade, limite de 2 por marca/medida, relatório, confirmação).

export function previewImport(content: string, format: ImportFormat): Promise<ImportReport> {
  const rows = parseImportFile(content, format);
  return validateImportRows(rows);
}

const CATEGORY_BY_VEHICLE_TYPE: Record<string, string> = {
  PASSENGER: "carro",
  SUV: "suv-caminhonete",
  LIGHT_TRUCK: "suv-caminhonete",
  MOTORCYCLE: "moto",
};

export type CommitImportResult = {
  createdCount: number;
  skippedCount: number;
  skipped: { row: number; reason: string }[];
};

// Recebe o relatório já validado (da preview) e grava só as linhas "valid".
// Reaplica a validação de limite dentro de uma transação por linha, porque
// entre a pré-visualização e a confirmação outra importação pode ter
// ocupado a mesma vaga de marca+medida — o banco (constraint única) é a
// fonte da verdade final, nunca só a validação em memória.
export async function commitImport(report: ImportReport): Promise<CommitImportResult> {
  const validRows = report.results.filter(
    (row): row is ImportRowResult & { resolved: NonNullable<ImportRowResult["resolved"]> } =>
      row.status === "valid" && row.resolved !== undefined,
  );

  let createdCount = 0;
  const skipped: { row: number; reason: string }[] = [];

  for (const row of validRows) {
    const { resolved } = row;
    try {
      await prisma.$transaction(async (tx) => {
        const brand = await tx.brand.findUnique({ where: { name: resolved.brandName } });
        if (!brand) {
          throw new Error(
            `Marca "${resolved.brandName}" não encontrada. Marcas fora de TOP_TIRE_BRANDS não podem ser importadas.`,
          );
        }

        const tireModelSlug = resolved.slug.replace(`${brand.slug}-`, "").replace(
          `-${resolved.width}-${resolved.aspectRatio}-r${resolved.rim}`,
          "",
        );
        const tireModel = await tx.tireModel.upsert({
          where: { brandId_slug: { brandId: brand.id, slug: tireModelSlug } },
          update: {},
          create: { brandId: brand.id, name: resolved.tireModelName, slug: tireModelSlug },
        });

        const categorySlug = CATEGORY_BY_VEHICLE_TYPE[resolved.vehicleType] ?? "carro";
        const category = await tx.category.findUnique({ where: { slug: categorySlug } });
        if (!category) {
          throw new Error(`Categoria "${categorySlug}" não encontrada.`);
        }

        const size = await tx.tireSize.upsert({
          where: {
            width_aspectRatio_rimDiameter_loadIndex_speedRating: {
              width: resolved.width,
              aspectRatio: resolved.aspectRatio,
              rimDiameter: resolved.rim,
              loadIndex: resolved.loadIndex,
              speedRating: resolved.speedIndex,
            },
          },
          update: {},
          create: {
            width: resolved.width,
            aspectRatio: resolved.aspectRatio,
            rimDiameter: resolved.rim,
            loadIndex: resolved.loadIndex,
            speedRating: resolved.speedIndex,
          },
        });

        // Revalida o limite de 2 por marca+medida dentro da transação — a
        // constraint única (brandId, sizeId, rankingPosition) do banco é
        // quem garante isso de fato; aqui só decidimos qual posição usar.
        const currentCount = await tx.product.count({
          where: { brandId: brand.id, sizeId: size.id },
        });
        if (currentCount >= 2) {
          throw new Error(
            `Limite de 2 modelos por marca/medida já foi atingido para ${resolved.brandName} ${resolved.width}/${resolved.aspectRatio} R${resolved.rim} (outra importação ocupou a vaga antes desta).`,
          );
        }
        const rankingPosition = currentCount === 0 ? "FIRST" : "SECOND";

        const product = await tx.product.create({
          data: {
            sku: resolved.sku,
            slug: resolved.slug,
            name: `Pneu ${resolved.brandName} ${resolved.tireModelName} ${resolved.width}/${resolved.aspectRatio} R${resolved.rim}`,
            description: resolved.description,
            brandId: brand.id,
            tireModelId: tireModel.id,
            categoryId: category.id,
            sizeId: size.id,
            width: resolved.width,
            aspectRatio: resolved.aspectRatio,
            rim: resolved.rim,
            loadIndex: resolved.loadIndex,
            speedIndex: resolved.speedIndex,
            runFlat: resolved.runFlat,
            vehicleType: resolved.vehicleType,
            rankingPosition,
            price: resolved.price,
            compareAtPrice: resolved.compareAtPrice,
            imageStatus: "PENDING_PERMISSION",
            source: resolved.source,
            sourceUrl: resolved.sourceUrl,
            sources: resolved.source
              ? {
                  create: {
                    sourceType: "IMPORT",
                    sourceName: resolved.source,
                    url: resolved.sourceUrl,
                    note: "Importado via /admin/importar-produtos.",
                  },
                }
              : undefined,
          },
        });

        await tx.stockItem.create({ data: { productId: product.id, quantity: 0 } });
      });
      createdCount += 1;
    } catch (error) {
      skipped.push({
        row: row.row,
        reason: error instanceof Error ? error.message : "Erro desconhecido ao importar esta linha.",
      });
    }
  }

  return { createdCount, skippedCount: skipped.length, skipped };
}
