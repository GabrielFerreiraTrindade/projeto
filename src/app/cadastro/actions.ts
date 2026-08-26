"use server";

import { redirect } from "next/navigation";

import { registerUser } from "@/lib/services/auth-service";

export type RegisterFormState = { error?: string } | undefined;

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const name = String(formData.get("name") ?? "");
  const cpf = String(formData.get("cpf") ?? "");
  const email = String(formData.get("email") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const result = await registerUser({ name, cpf, email, phone, password });
  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/minha-conta");
}
