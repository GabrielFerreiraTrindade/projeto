import { describe, expect, it } from "vitest";

import {
  estimateShipping,
  isSoutheastCep,
} from "@/lib/services/shipping-service";

describe("isSoutheastCep", () => {
  it("reconhece CEPs de SP, RJ, ES e MG como Sudeste", () => {
    expect(isSoutheastCep("01310-100")).toBe(true); // SP
    expect(isSoutheastCep("20040-020")).toBe(true); // RJ
    expect(isSoutheastCep("29010-000")).toBe(true); // ES
    expect(isSoutheastCep("30130-010")).toBe(true); // MG
  });

  it("reconhece CEPs fora do Sudeste", () => {
    expect(isSoutheastCep("40010-000")).toBe(false); // BA
    expect(isSoutheastCep("70040-010")).toBe(false); // DF
    expect(isSoutheastCep("90010-000")).toBe(false); // RS
  });

  it("CEP inválido nunca é Sudeste", () => {
    expect(isSoutheastCep("123")).toBe(false);
  });
});

describe("estimateShipping — frete grátis automático", () => {
  it("Sudeste: grátis a partir de R$400, cobra abaixo disso", () => {
    expect(estimateShipping("30130-010", 400).price).toBe(0);
    expect(estimateShipping("30130-010", 500).price).toBe(0);
    expect(estimateShipping("30130-010", 399.9).price).toBeGreaterThan(0);
  });

  it("Resto do Brasil: grátis a partir de R$1.500, cobra abaixo disso", () => {
    expect(estimateShipping("90010-000", 1500).price).toBe(0);
    expect(estimateShipping("90010-000", 2000).price).toBe(0);
    expect(estimateShipping("90010-000", 1499.9).price).toBeGreaterThan(0);
  });

  it("R$500 fora do Sudeste ainda paga frete (não atinge R$1.500)", () => {
    expect(estimateShipping("90010-000", 500).price).toBeGreaterThan(0);
  });
});
