"use server";

import { redirect } from "next/navigation";

import { resetPassword } from "@/lib/services/auth-service";

export type ResetPasswordFormState = { error?: string } | undefined;

export async function resetPasswordAction(
  _prevState: ResetPasswordFormState,
  formData: FormData,
): Promise<ResetPasswordFormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const result = await resetPassword(token, password);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/login?redefinida=1");
}
