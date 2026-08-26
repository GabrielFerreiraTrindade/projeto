"use server";

import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/services/auth-service";
import { commitImport, previewImport } from "@/lib/services/catalog-import-service";
import type { ImportFormat, ImportReport } from "@/lib/catalog/import/types";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin/importar-produtos");
  if (user.role !== "ADMIN") notFound();
}

export async function previewImportAction(
  content: string,
  format: ImportFormat,
): Promise<{ report?: ImportReport; error?: string }> {
  await requireAdmin();

  try {
    const report = await previewImport(content, format);
    return { report };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível interpretar o arquivo. Verifique o formato e tente novamente.",
    };
  }
}

export async function confirmImportAction(report: ImportReport) {
  await requireAdmin();
  return commitImport(report);
}
