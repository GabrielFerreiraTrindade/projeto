"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/services/auth-service";
import { applyBulkDiscount, clearAllDiscounts, updateProductPrice } from "@/lib/services/catalog-admin-service";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin/catalogo");
  if (user.role !== "ADMIN") notFound();
}

export type PriceActionResult = { error?: string; success?: string };

export async function updateProductPriceAction(
  productId: string,
  price: number,
  compareAtPrice: number | null,
): Promise<PriceActionResult> {
  await requireAdmin();

  try {
    await updateProductPrice(productId, price, compareAtPrice);
    revalidatePath("/admin/catalogo");
    revalidatePath("/");
    return { success: "Preço atualizado." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível atualizar o preço." };
  }
}

export async function applyBulkDiscountAction(percent: number): Promise<PriceActionResult> {
  await requireAdmin();

  try {
    const count = await applyBulkDiscount(percent);
    revalidatePath("/admin/catalogo");
    revalidatePath("/");
    return { success: `Desconto de ${percent}% aplicado em ${count} produto(s) ativos.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível aplicar o desconto." };
  }
}

export async function clearAllDiscountsAction(): Promise<PriceActionResult> {
  await requireAdmin();

  try {
    const count = await clearAllDiscounts();
    revalidatePath("/admin/catalogo");
    revalidatePath("/");
    return { success: `Desconto removido de ${count} produto(s).` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível remover os descontos." };
  }
}
