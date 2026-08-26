"use server";

import { headers } from "next/headers";

import { requestPasswordReset } from "@/lib/services/auth-service";

export type RequestResetState =
  { submitted: true; resetUrl?: string } | undefined;

export async function requestResetAction(
  _prevState: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  const email = String(formData.get("email") ?? "");

  const headersList = await headers();
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const baseUrl =
    configuredUrl ??
    `${headersList.get("x-forwarded-proto") ?? "http"}://${headersList.get("host")}`;

  const result = await requestPasswordReset(email, baseUrl);

  return { submitted: true, resetUrl: result?.resetUrl };
}
