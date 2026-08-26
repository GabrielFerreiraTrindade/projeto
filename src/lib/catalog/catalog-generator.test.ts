import { describe, expect, it } from "vitest";

import { assertMaxTwoModelsPerBrandPerSize, generateCatalog } from "@/lib/catalog/catalog-generator";
import { MAX_MODELS_PER_BRAND_PER_SIZE, TOP_TIRE_BRANDS } from "@/lib/catalog/top-brands";

describe("generateCatalog", () => {
  it("gera pelo menos 100 produtos fictícios", () => {
    const products = generateCatalog();
    expect(products.length).toBeGreaterThanOrEqual(100);
  });

  it("nunca gera mais de 2 modelos da mesma marca para a mesma medida", () => {
    const products = generateCatalog();
    expect(() => assertMaxTwoModelsPerBrandPerSize(products)).not.toThrow();

    const counts = new Map<string, number>();
    for (const product of products) {
      const key = `${product.brandName}__${product.width}-${product.aspectRatio}-${product.rim}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    for (const count of counts.values()) {
      expect(count).toBeLessThanOrEqual(MAX_MODELS_PER_BRAND_PER_SIZE);
    }
  });

  it("usa somente as marcas prioritárias configuradas", () => {
    const products = generateCatalog();
    const brandsUsed = new Set(products.map((product) => product.brandName));
    for (const brand of brandsUsed) {
      expect(TOP_TIRE_BRANDS).toContain(brand);
    }
  });

  it("nunca publica uma imagem sem autorização explícita", () => {
    const products = generateCatalog();
    for (const product of products) {
      expect(product.imageStatus).toBe("PENDING_PERMISSION");
    }
  });

  it("detecta uma violação da regra de 2 modelos por marca/medida (guarda de regressão)", () => {
    const products = generateCatalog();
    // Precisa de uma combinação marca+medida que já tenha os 2 modelos
    // elegíveis (nem toda combinação tem 2, já que cada linha só existe em
    // uma faixa real de aro) — só assim adicionar uma 3ª linha é de fato
    // uma violação da regra.
    const counts = new Map<string, number>();
    for (const product of products) {
      const key = `${product.brandName}__${product.width}-${product.aspectRatio}-${product.rim}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const full = products.find((product) => {
      const key = `${product.brandName}__${product.width}-${product.aspectRatio}-${product.rim}`;
      return counts.get(key) === MAX_MODELS_PER_BRAND_PER_SIZE;
    });
    if (!full) throw new Error("Nenhuma combinação com 2 modelos encontrada para testar a violação.");

    const fakeThirdModel = { ...full, sku: `${full.sku}-EXTRA`, slug: `${full.slug}-extra` };
    expect(() => assertMaxTwoModelsPerBrandPerSize([...products, fakeThirdModel])).toThrow();
  });
});
