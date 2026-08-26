"use server";

import { redirect } from "next/navigation";

import {
  getCurrentUser,
  logoutUser,
  updateProfile,
} from "@/lib/services/auth-service";

export async function logoutAction() {
  await logoutUser();
  redirect("/");
}

export type UpdateProfileState =
  { error?: string; success?: boolean } | undefined;

export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "");
  const phone = String(formData.get("phone") ?? "");

  if (name.trim().length < 3) {
    return { error: "Informe seu nome completo." };
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return { error: "Informe um telefone válido, com DDD." };
  }

  await updateProfile(user.id, { name, phone });
  return { success: true };
}
