import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { parseCsv, parseJson, parseXml } from "@/lib/catalog/import/parsers";
import { validateImportRows } from "@/lib/catalog/import/validate";
import { commitImport } from "@/lib/services/catalog-import-service";
import type { ImportRowInput } from "@/lib/catalog/import/types";

const SKU_PREFIX = "TEST-IMPORT-";
// Medida sintética que não existe no catálogo semeado, para não depender de
// quantos produtos Pirelli já tem em medidas reais (evita testes frágeis se
// o catálogo gerado mudar no futuro).
const SYNTHETIC_SIZE = { width: 999, aspectRatio: 99, rim: 99 };

describe("import de catálogo — parsers", () => {
  it("parseCsv interpreta cabeçalho e linhas, respeitando aspas", () => {
    const csv = 'brand,tireModel,price\nPirelli,"Cinturato, P1",399.90\n';
    const rows = parseCsv(csv);
    expect(rows).toEqual([{ brand: "Pirelli", tireModel: "Cinturato, P1", price: "399.90" }]);
  });

  it("parseJson aceita uma lista ou { products: [...] }", () => {
    expect(parseJson('[{"brand":"Pirelli"}]')).toEqual([{ brand: "Pirelli" }]);
    expect(parseJson('{"products":[{"brand":"Pirelli"}]}')).toEqual([{ brand: "Pirelli" }]);
  });

  it("parseXml interpreta <products><product>...</product></products>", () => {
    const xml = "<products><product><brand>Pirelli</brand></product></products>";
    expect(parseXml(xml)).toEqual([{ brand: "Pirelli" }]);
  });
});

describe("import de catálogo — validação", () => {
  let pirelliBrandId: string;
  let pirelliModelSlugs: string[];

  beforeAll(async () => {
    const brand = await prisma.brand.findUniqueOrThrow({ where: { name: "Pirelli" } });
    pirelliBrandId = brand.id;
    const models = await prisma.tireModel.findMany({ where: { brandId: brand.id }, take: 2 });
    pirelliModelSlugs = models.map((m) => m.slug);
  });

  afterAll(async () => {
    await prisma.productScore.deleteMany({ where: { product: { sku: { startsWith: SKU_PREFIX } } } });
    await prisma.productSource.deleteMany({ where: { product: { sku: { startsWith: SKU_PREFIX } } } });
    await prisma.stockItem.deleteMany({ where: { product: { sku: { startsWith: SKU_PREFIX } } } });
    await prisma.product.deleteMany({ where: { sku: { startsWith: SKU_PREFIX } } });
  });

  function row(overrides: Partial<ImportRowInput> = {}): ImportRowInput {
    return {
      brand: "Pirelli",
      tireModel: "Novo Modelo Teste",
      width: "205",
      aspectRatio: "45",
      rim: "18",
      loadIndex: "90",
      speedIndex: "V",
      price: "500",
      ...overrides,
    };
  }

  it("rejeita marca fora de TOP_TIRE_BRANDS", async () => {
    const report = await validateImportRows([row({ brand: "MarcaDesconhecidaXYZ" })]);
    expect(report.results[0].status).toBe("rejected");
    expect(report.results[0].reasons.join(" ")).toMatch(/não está entre as 10 marcas prioritárias/);
  });

  it("rejeita campos obrigatórios ausentes", async () => {
    const report = await validateImportRows([row({ loadIndex: "", speedIndex: "" })]);
    expect(report.results[0].status).toBe("rejected");
  });

  it("detecta SKU duplicado dentro do mesmo arquivo", async () => {
    const report = await validateImportRows([
      row({ sku: "DUP-1" }),
      row({ sku: "DUP-1", tireModel: "Outro Nome" }),
    ]);
    expect(report.results[0].status).toBe("valid");
    expect(report.results[1].status).toBe("duplicate");
  });

  it("aplica o limite de 2 modelos por marca/medida dentro do próprio arquivo (3ª linha rejeitada)", async () => {
    const report = await validateImportRows([
      row({ tireModel: "Modelo A", sku: "LIMIT-A" }),
      row({ tireModel: "Modelo B", sku: "LIMIT-B" }),
      row({ tireModel: "Modelo C", sku: "LIMIT-C" }),
    ]);
    expect(report.results[0].status).toBe("valid");
    expect(report.results[1].status).toBe("valid");
    expect(report.results[2].status).toBe("rejected");
    expect(report.results[2].reasons.join(" ")).toMatch(/Limite atingido/);
  });

  it("aplica o limite de 2 modelos por marca/medida considerando o que já existe no banco", async () => {
    // Pré-condição: Pirelli já tem 2 produtos na medida sintética.
    for (const [index, modelSlug] of pirelliModelSlugs.entries()) {
      const category = await prisma.category.findUniqueOrThrow({ where: { slug: "carro" } });
      const size = await prisma.tireSize.upsert({
        where: {
          width_aspectRatio_rimDiameter_loadIndex_speedRating: {
            width: SYNTHETIC_SIZE.width,
            aspectRatio: SYNTHETIC_SIZE.aspectRatio,
            rimDiameter: SYNTHETIC_SIZE.rim,
            loadIndex: "90",
            speedRating: "V",
          },
        },
        update: {},
        create: {
          width: SYNTHETIC_SIZE.width,
          aspectRatio: SYNTHETIC_SIZE.aspectRatio,
          rimDiameter: SYNTHETIC_SIZE.rim,
          loadIndex: "90",
          speedRating: "V",
        },
      });
      const tireModel = await prisma.tireModel.findUniqueOrThrow({
        where: { brandId_slug: { brandId: pirelliBrandId, slug: modelSlug } },
      });
      await prisma.product.create({
        data: {
          sku: `${SKU_PREFIX}EXISTING-${index}`,
          slug: `${SKU_PREFIX.toLowerCase()}existing-${index}`,
          name: "Produto de teste (limite já atingido)",
          brandId: pirelliBrandId,
          tireModelId: tireModel.id,
          categoryId: category.id,
          sizeId: size.id,
          width: SYNTHETIC_SIZE.width,
          aspectRatio: SYNTHETIC_SIZE.aspectRatio,
          rim: SYNTHETIC_SIZE.rim,
          loadIndex: "90",
          speedIndex: "V",
          rankingPosition: index === 0 ? "FIRST" : "SECOND",
          price: 500,
        },
      });
    }

    const report = await validateImportRows([
      row({
        tireModel: "Terceiro Modelo Não Permitido",
        sku: "SHOULD-BE-REJECTED",
        width: String(SYNTHETIC_SIZE.width),
        aspectRatio: String(SYNTHETIC_SIZE.aspectRatio),
        rim: String(SYNTHETIC_SIZE.rim),
      }),
    ]);
    expect(report.results[0].status).toBe("rejected");
    expect(report.results[0].reasons.join(" ")).toMatch(/Limite atingido/);
  });
});

describe("import de catálogo — commitImport", () => {
  afterAll(async () => {
    await prisma.productScore.deleteMany({ where: { product: { sku: { startsWith: SKU_PREFIX } } } });
    await prisma.productSource.deleteMany({ where: { product: { sku: { startsWith: SKU_PREFIX } } } });
    await prisma.stockItem.deleteMany({ where: { product: { sku: { startsWith: SKU_PREFIX } } } });
    await prisma.product.deleteMany({ where: { sku: { startsWith: SKU_PREFIX } } });
  });

  it("cria apenas as linhas válidas e não excede 2 produtos por marca/medida", async () => {
    const rows: ImportRowInput[] = [
      {
        brand: "Michelin",
        tireModel: "Commit Teste 1",
        width: "210",
        aspectRatio: "40",
        rim: "19",
        loadIndex: "90",
        speedIndex: "V",
        price: "600",
        sku: `${SKU_PREFIX}COMMIT-1`,
      },
      {
        brand: "Michelin",
        tireModel: "Commit Teste 2",
        width: "210",
        aspectRatio: "40",
        rim: "19",
        loadIndex: "90",
        speedIndex: "V",
        price: "650",
        sku: `${SKU_PREFIX}COMMIT-2`,
      },
    ];

    const report = await validateImportRows(rows);
    expect(report.validCount).toBe(2);

    const result = await commitImport(report);
    expect(result.createdCount).toBe(2);
    expect(result.skippedCount).toBe(0);

    const created = await prisma.product.findMany({
      where: { sku: { startsWith: `${SKU_PREFIX}COMMIT-` } },
    });
    expect(created).toHaveLength(2);
    expect(new Set(created.map((p) => p.rankingPosition))).toEqual(new Set(["FIRST", "SECOND"]));
  });
});
