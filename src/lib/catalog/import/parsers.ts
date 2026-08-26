import { XMLParser } from "fast-xml-parser";

import type { ImportRowInput } from "@/lib/catalog/import/types";

// Três formatos de entrada aceitos (seção 12 do pedido de catálogo): CSV,
// JSON e XML. Todos viram a mesma forma intermediária (ImportRowInput[])
// antes de validar — o resto do pipeline de importação não sabe de onde os
// dados vieram.

export class ImportParseError extends Error {}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

export function parseCsv(content: string): ImportRowInput[] {
  const lines = content.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const header = parseCsvLine(lines[0]).map((column) => column.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    header.forEach((column, index) => {
      row[column] = (values[index] ?? "").trim();
    });
    return row as ImportRowInput;
  });
}

export function parseJson(content: string): ImportRowInput[] {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    throw new ImportParseError("JSON inválido: não foi possível interpretar o arquivo.");
  }

  const rows = Array.isArray(data) ? data : (data as { products?: unknown[] })?.products;
  if (!Array.isArray(rows)) {
    throw new ImportParseError(
      'JSON deve ser uma lista de produtos, ou um objeto no formato { "products": [...] }.',
    );
  }
  return rows as ImportRowInput[];
}

const xmlParser = new XMLParser({ ignoreAttributes: true, trimValues: true });

export function parseXml(content: string): ImportRowInput[] {
  let data: unknown;
  try {
    data = xmlParser.parse(content);
  } catch {
    throw new ImportParseError("XML inválido: não foi possível interpretar o arquivo.");
  }

  const root = (data as Record<string, unknown>)?.products as
    | { product?: unknown }
    | undefined;
  const rawProducts = root?.product;
  if (!rawProducts) {
    throw new ImportParseError(
      "XML deve ter a estrutura <products><product>...</product></products>.",
    );
  }
  const rows = Array.isArray(rawProducts) ? rawProducts : [rawProducts];
  return rows as ImportRowInput[];
}

export function parseImportFile(content: string, format: "csv" | "json" | "xml"): ImportRowInput[] {
  if (format === "csv") return parseCsv(content);
  if (format === "json") return parseJson(content);
  return parseXml(content);
}
