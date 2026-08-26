"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/services/auth-service";
import { applyModelPhotos, setCoverPhoto } from "@/lib/services/product-photo-service";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin/fotos-produtos");
  if (user.role !== "ADMIN") notFound();
}

const MAX_FILES = 3;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type UploadModelPhotosResult = { error?: string; success?: string };

export async function uploadModelPhotosAction(
  formData: FormData,
): Promise<UploadModelPhotosResult> {
  await requireAdmin();

  const tireModelId = formData.get("tireModelId");
  if (typeof tireModelId !== "string" || !tireModelId) {
    return { error: "Selecione marca e modelo antes de enviar as fotos." };
  }

  const tireModel = await prisma.tireModel.findUnique({
    where: { id: tireModelId },
    include: { brand: true },
  });
  if (!tireModel) {
    return { error: "Modelo não encontrado." };
  }

  const files = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return { error: "Escolha pelo menos uma foto." };
  }
  if (files.length > MAX_FILES) {
    return { error: `No máximo ${MAX_FILES} fotos por modelo.` };
  }
  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return { error: `Formato não suportado: ${file.type || "desconhecido"}. Use JPG, PNG ou WebP.` };
    }
  }

  const dir = path.join(
    process.cwd(),
    "public",
    "product-images",
    tireModel.brand.slug,
    tireModel.slug,
  );
  await mkdir(dir, { recursive: true });

  const urls: string[] = [];
  for (const [index, file] of files.entries()) {
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${randomUUID()}-${index}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);
    urls.push(`/product-images/${tireModel.brand.slug}/${tireModel.slug}/${filename}`);
  }

  const { updatedProducts } = await applyModelPhotos(tireModelId, urls);

  revalidatePath("/admin/fotos-produtos");
  revalidatePath("/admin/catalogo");
  revalidatePath("/");

  return {
    success: `${urls.length} foto(s) aplicada(s) em ${updatedProducts} produto(s) de ${tireModel.brand.name} ${tireModel.name} (todas as medidas).`,
  };
}

export type SetCoverPhotoResult = { error?: string; success?: string };

export async function setCoverPhotoAction(
  tireModelId: string,
  coverUrl: string,
): Promise<SetCoverPhotoResult> {
  await requireAdmin();

  if (!tireModelId || !coverUrl) {
    return { error: "Selecione uma foto para virar capa." };
  }

  try {
    const { updatedProducts } = await setCoverPhoto(tireModelId, coverUrl);
    revalidatePath("/admin/fotos-produtos");
    revalidatePath("/admin/catalogo");
    revalidatePath("/");
    return { success: `Capa atualizada em ${updatedProducts} produto(s).` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Não foi possível atualizar a capa.",
    };
  }
}
