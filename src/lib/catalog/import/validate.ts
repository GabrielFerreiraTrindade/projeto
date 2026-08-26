import { prisma } from "@/lib/prisma";
import { MAX_MODELS_PER_BRAND_PER_SIZE, TOP_TIRE_BRANDS } from "@/lib/catalog/top-brands";
import type { ImportRowInput, ImportRowResult, ImportReport } from "@/lib/catalog/import/types";

// Validação da importação (seção 12): cada linha é checada individualmente
// e o relatório final mostra o que foi aceito, rejeitado e por quê — nada é
// gravado no banco aqui (ver commitImport em catalog-import-service.ts).
//
// A regra de "no máximo 2 modelos por marca por medida" é aplicada
// considerando o que já existe no banco (marca X já tem 2 produtos nesta
// medida) e o que está no próprio arquivo (duas linhas do arquivo com a
// mesma marca e medida) — os dois casos contam para o mesmo limite.

const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseIntStrict(value: string | undefined): number | null {
  const parsed = parseNumber(value);
  return parsed !== null && Number.isInteger(parsed) ? parsed : null;
}

const VALID_VEHICLE_TYPES = ["PASSENGER", "SUV", "LIGHT_TRUCK", "MOTORCYCLE"] as const;

export async function validateImportRows(inputs: ImportRowInput[]): Promise<ImportReport> {
  // Conta quantos produtos cada (marca, medida) já tem no banco, para somar
  // com o que está sendo importado agora.
  const existingCounts = new Map<string, number>();
  const brandRows = await prisma.brand.findMany({
    where: { name: { in: [...TOP_TIRE_BRANDS] } },
    include: { products: { select: { width: true, aspectRatio: true, rim: true } } },
  });
  for (const brand of brandRows) {
    for (const product of brand.products) {
      const key = `${brand.name}__${product.width}-${product.aspectRatio}-${product.rim}`;
      existingCounts.set(key, (existingCounts.get(key) ?? 0) + 1);
    }
  }

  const existingSkus = new Set(
    (await prisma.product.findMany({ select: { sku: true } })).map((p) => p.sku),
  );
  const existingSlugs = new Set(
    (await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug),
  );

  const batchCounts = new Map<string, number>();
  const skusInBatch = new Set<string>();
  const results: ImportRowResult[] = [];

  inputs.forEach((input, index) => {
    const rowNumber = index + 1;
    const reasons: string[] = [];

    const brandName = input.brand?.trim();
    if (!brandName) {
      reasons.push("Campo 'brand' é obrigatório.");
    } else if (!TOP_TIRE_BRANDS.includes(brandName as (typeof TOP_TIRE_BRANDS)[number])) {
      reasons.push(
        `Marca "${brandName}" não está entre as ${TOP_TIRE_BRANDS.length} marcas prioritárias configuradas (TOP_TIRE_BRANDS). Alterar a lista de marcas é uma decisão administrativa explícita, não algo que uma importação pode fazer sozinha.`,
      );
    }

    const tireModelName = input.tireModel?.trim();
    if (!tireModelName) reasons.push("Campo 'tireModel' é obrigatório.");

    const width = parseIntStrict(input.width);
    if (width === null) reasons.push("Campo 'width' deve ser um número inteiro.");
    const aspectRatio = parseIntStrict(input.aspectRatio);
    if (aspectRatio === null) reasons.push("Campo 'aspectRatio' deve ser um número inteiro.");
    const rim = parseIntStrict(input.rim);
    if (rim === null) reasons.push("Campo 'rim' deve ser um número inteiro.");

    const loadIndex = input.loadIndex?.trim();
    if (!loadIndex) reasons.push("Campo 'loadIndex' é obrigatório.");
    const speedIndex = input.speedIndex?.trim();
    if (!speedIndex) reasons.push("Campo 'speedIndex' é obrigatório.");

    const price = parseNumber(input.price);
    if (price === null || price <= 0) reasons.push("Campo 'price' deve ser um número maior que zero.");
    const compareAtPrice = input.compareAtPrice ? parseNumber(input.compareAtPrice) : null;
    if (input.compareAtPrice && compareAtPrice === null) {
      reasons.push("Campo 'compareAtPrice' deve ser um número.");
    }

    const vehicleTypeRaw = (input.vehicleType?.trim().toUpperCase() || "PASSENGER") as
      (typeof VALID_VEHICLE_TYPES)[number];
    if (!VALID_VEHICLE_TYPES.includes(vehicleTypeRaw)) {
      reasons.push(
        `Campo 'vehicleType' inválido ("${input.vehicleType}"). Valores aceitos: ${VALID_VEHICLE_TYPES.join(", ")}.`,
      );
    }

    const runFlat = ["true", "1", "sim", "yes"].includes(
      (input.runFlat ?? "").trim().toLowerCase(),
    );

    let sku = input.sku?.trim();
    let slug: string | undefined;
    if (brandName && tireModelName && width !== null && aspectRatio !== null && rim !== null) {
      const sizeSlug = `${width}-${aspectRatio}-r${rim}`;
      slug = `${slugify(brandName)}-${slugify(tireModelName)}-${sizeSlug}`;
      sku = sku || slug.toUpperCase();
    }

    let status: ImportRowResult["status"] = reasons.length > 0 ? "rejected" : "valid";

    if (status === "valid" && sku && (existingSkus.has(sku) || skusInBatch.has(sku))) {
      status = "duplicate";
      reasons.push(`SKU "${sku}" já existe (no catálogo atual ou em outra linha deste arquivo).`);
    }
    if (status === "valid" && slug && existingSlugs.has(slug)) {
      status = "duplicate";
      reasons.push(`Já existe um produto com a mesma marca, modelo e medida ("${slug}").`);
    }

    let rankingPosition: "FIRST" | "SECOND" | null = null;
    if (status === "valid" && brandName && width !== null && aspectRatio !== null && rim !== null) {
      const key = `${brandName}__${width}-${aspectRatio}-${rim}`;
      const existing = existingCounts.get(key) ?? 0;
      const inBatch = batchCounts.get(key) ?? 0;
      const nextPosition = existing + inBatch;

      if (nextPosition >= MAX_MODELS_PER_BRAND_PER_SIZE) {
        status = "rejected";
        reasons.push(
          `Limite atingido: a marca "${brandName}" já tem ${MAX_MODELS_PER_BRAND_PER_SIZE} modelos cadastrados para a medida ${width}/${aspectRatio} R${rim} (contando produtos já existentes e outras linhas deste arquivo). Este produto não será importado.`,
        );
      } else {
        rankingPosition = nextPosition === 0 ? "FIRST" : "SECOND";
        batchCounts.set(key, inBatch + 1);
      }
    }

    if (sku) skusInBatch.add(sku);

    results.push({
      row: rowNumber,
      input,
      status,
      reasons,
      resolved:
        status === "valid" &&
        brandName &&
        tireModelName &&
        width !== null &&
        aspectRatio !== null &&
        rim !== null &&
        loadIndex &&
        speedIndex &&
        price !== null &&
        sku &&
        slug &&
        rankingPosition
          ? {
              sku,
              slug,
              brandName,
              tireModelName,
              width,
              aspectRatio,
              rim,
              loadIndex,
              speedIndex,
              price,
              compareAtPrice: compareAtPrice ?? null,
              description:
                input.description?.trim() ||
                `Este pneu possui medida ${width}/${aspectRatio} R${rim}, índice de carga ${loadIndex} e índice de velocidade ${speedIndex}.`,
              source: input.source?.trim() || null,
              sourceUrl: input.sourceUrl?.trim() || null,
              vehicleType: vehicleTypeRaw,
              runFlat,
              rankingPosition,
            }
          : undefined,
    });
  });

  return {
    totalRows: results.length,
    validCount: results.filter((r) => r.status === "valid").length,
    rejectedCount: results.filter((r) => r.status === "rejected").length,
    duplicateCount: results.filter((r) => r.status === "duplicate").length,
    results,
  };
}
