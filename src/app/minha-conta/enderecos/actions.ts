"use server";

import { redirect } from "next/navigation";

import {
  createAddress,
  removeAddress,
  setDefaultAddress,
  updateAddress,
  type AddressInput,
} from "@/lib/services/address-service";
import { getCurrentUser } from "@/lib/services/auth-service";

function readAddressInput(formData: FormData): AddressInput {
  return {
    label: String(formData.get("label") ?? ""),
    recipient: String(formData.get("recipient") ?? ""),
    street: String(formData.get("street") ?? ""),
    number: String(formData.get("number") ?? ""),
    complement: String(formData.get("complement") ?? ""),
    neighborhood: String(formData.get("neighborhood") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    zipCode: String(formData.get("zipCode") ?? ""),
    isDefault: formData.get("isDefault") === "on",
  };
}

export type AddressFormState = { error?: string } | undefined;

export async function createAddressAction(
  _prevState: AddressFormState,
  formData: FormData,
): Promise<AddressFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/minha-conta/enderecos");

  const result = await createAddress(user.id, readAddressInput(formData));
  if (!result.ok) return { error: result.error };

  redirect("/minha-conta/enderecos");
}

export async function updateAddressAction(
  _prevState: AddressFormState,
  formData: FormData,
): Promise<AddressFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/minha-conta/enderecos");

  const id = String(formData.get("id") ?? "");
  const result = await updateAddress(user.id, id, readAddressInput(formData));
  if (!result.ok) return { error: result.error };

  redirect("/minha-conta/enderecos");
}

export async function deleteAddressAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/minha-conta/enderecos");

  await removeAddress(user.id, String(formData.get("id") ?? ""));
  redirect("/minha-conta/enderecos");
}

export async function setDefaultAddressAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/minha-conta/enderecos");

  await setDefaultAddress(user.id, String(formData.get("id") ?? ""));
  redirect("/minha-conta/enderecos");
}
