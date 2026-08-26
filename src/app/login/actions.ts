"use server";

import { redirect } from "next/navigation";

import { loginUser } from "@/lib/services/auth-service";

export type LoginFormState = { error?: string } | undefined;

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") || "/minha-conta");

  const result = await loginUser(email, password);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/minha-conta");
}
