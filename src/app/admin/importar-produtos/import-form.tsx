"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { ImportFormat, ImportReport } from "@/lib/catalog/import/types";
import { confirmImportAction, previewImportAction } from "./actions";

function detectFormat(fileName: string): ImportFormat | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".xml")) return "xml";
  return null;
}

const STATUS_LABEL: Record<string, string> = {
  valid: "Pronto para importar",
  rejected: "Rejeitado",
  duplicate: "Duplicado",
};

export function ImportForm() {
  const [content, setContent] = useState<string | null>(null);
  const [format, setFormat] = useState<ImportFormat | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [confirmResult, setConfirmResult] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const detected = detectFormat(file.name);
    if (!detected) {
      setError("Formato não suportado. Envie um arquivo .csv, .json ou .xml.");
      return;
    }

    const text = await file.text();
    setContent(text);
    setFormat(detected);
    setFileName(file.name);
    setReport(null);
    setConfirmResult(null);
    setError(null);
  }

  async function handlePreview() {
    if (!content || !format) return;
    setIsBusy(true);
    setError(null);
    setConfirmResult(null);
    try {
      const result = await previewImportAction(content, format);
      if (result.error) {
        setError(result.error);
        setReport(null);
      } else if (result.report) {
        setReport(result.report);
      }
    } finally {
      setIsBusy(false);
    }
  }

  async function handleConfirm() {
    if (!report) return;
    setIsBusy(true);
    try {
      const result = await confirmImportAction(report);
      setConfirmResult(
        `${result.createdCount} produto(s) importado(s). ${result.skippedCount} linha(s) não puderam ser importadas no momento da confirmação.`,
      );
      setReport(null);
      setContent(null);
      setFileName(null);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <label className="text-sm font-medium text-foreground" htmlFor="import-file">
          Arquivo (.csv, .json ou .xml)
        </label>
        <input
          id="import-file"
          type="file"
          accept=".csv,.json,.xml"
          onChange={handleFileChange}
          className="text-sm text-foreground"
        />
        {fileName && (
          <p className="text-xs text-muted-foreground">
            Selecionado: {fileName} ({format})
          </p>
        )}
        <button
          type="button"
          onClick={handlePreview}
          disabled={!content || isBusy}
          className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Pré-visualizar
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {confirmResult && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{confirmResult}</p>
      )}

      {report && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 rounded-xl border border-border p-4 text-sm">
            <span>Total de linhas: {report.totalRows}</span>
            <span className="text-green-700">Válidas: {report.validCount}</span>
            <span className="text-amber-700">Duplicadas: {report.duplicateCount}</span>
            <span className="text-red-700">Rejeitadas: {report.rejectedCount}</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Linha</th>
                  <th className="px-4 py-3">Marca</th>
                  <th className="px-4 py-3">Modelo</th>
                  <th className="px-4 py-3">Medida</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.results.map((row) => (
                  <tr key={row.row}>
                    <td className="px-4 py-3">{row.row}</td>
                    <td className="px-4 py-3">{row.input.brand ?? "—"}</td>
                    <td className="px-4 py-3">{row.input.tireModel ?? "—"}</td>
                    <td className="px-4 py-3">
                      {row.input.width && row.input.aspectRatio && row.input.rim
                        ? `${row.input.width}/${row.input.aspectRatio} R${row.input.rim}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          row.status === "valid" && "bg-green-100 text-green-800",
                          row.status === "duplicate" && "bg-amber-100 text-amber-800",
                          row.status === "rejected" && "bg-red-100 text-red-800",
                        )}
                      >
                        {STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {row.reasons.join(" ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={report.validCount === 0 || isBusy}
            className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Confirmar importação ({report.validCount} produto(s))
          </button>
        </div>
      )}
    </div>
  );
}
