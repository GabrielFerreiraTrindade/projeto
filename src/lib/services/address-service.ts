import crypto from "node:crypto";

import {
  addressRepository,
  type NewAddress,
} from "@/lib/repositories/address-repository";
import type { Address } from "@/types/account";

export async function listAddresses(userId: string): Promise<Address[]> {
  return addressRepository.findByUserId(userId);
}

export type AddressInput = {
  label?: string;
  recipient: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
};

function validate(input: AddressInput): string | null {
  if (!input.recipient.trim()) return "Informe o nome do destinatário.";
  if (!input.street.trim()) return "Informe a rua.";
  if (!input.number.trim()) return "Informe o número.";
  if (!input.neighborhood.trim()) return "Informe o bairro.";
  if (!input.city.trim()) return "Informe a cidade.";
  if (input.state.trim().length !== 2) return "Informe o estado (UF).";
  if (input.zipCode.replace(/\D/g, "").length !== 8)
    return "Informe um CEP válido.";
  return null;
}

export type AddressResult =
  { ok: true; address: Address } | { ok: false; error: string };

export async function createAddress(
  userId: string,
  input: AddressInput,
): Promise<AddressResult> {
  const error = validate(input);
  if (error) return { ok: false, error };

  const isFirstAddress =
    (await addressRepository.findByUserId(userId)).length === 0;

  const address: NewAddress = {
    id: crypto.randomUUID(),
    userId,
    label: input.label?.trim() || null,
    recipient: input.recipient.trim(),
    street: input.street.trim(),
    number: input.number.trim(),
    complement: input.complement?.trim() || null,
    neighborhood: input.neighborhood.trim(),
    city: input.city.trim(),
    state: input.state.trim().toUpperCase(),
    zipCode: input.zipCode.replace(/\D/g, ""),
    isDefault: Boolean(input.isDefault) || isFirstAddress,
  };

  const created = await addressRepository.create(address);
  if (created.isDefault) {
    await addressRepository.setDefault(userId, created.id);
  }

  return { ok: true, address: created };
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: AddressInput,
): Promise<AddressResult> {
  const existing = await addressRepository.findById(addressId);
  if (!existing || existing.userId !== userId) {
    return { ok: false, error: "Endereço não encontrado." };
  }

  const error = validate(input);
  if (error) return { ok: false, error };

  const updated = await addressRepository.update(addressId, {
    label: input.label?.trim() || null,
    recipient: input.recipient.trim(),
    street: input.street.trim(),
    number: input.number.trim(),
    complement: input.complement?.trim() || null,
    neighborhood: input.neighborhood.trim(),
    city: input.city.trim(),
    state: input.state.trim().toUpperCase(),
    zipCode: input.zipCode.replace(/\D/g, ""),
  });

  if (!updated) return { ok: false, error: "Endereço não encontrado." };

  if (input.isDefault) {
    await addressRepository.setDefault(userId, addressId);
  }

  return { ok: true, address: updated };
}

export async function removeAddress(
  userId: string,
  addressId: string,
): Promise<void> {
  const existing = await addressRepository.findById(addressId);
  if (!existing || existing.userId !== userId) return;

  await addressRepository.remove(addressId);

  // Se o endereço removido era o padrão, promove outro (se houver) para
  // que o usuário nunca fique sem um endereço padrão enquanto tiver algum.
  if (existing.isDefault) {
    const remaining = await addressRepository.findByUserId(userId);
    if (remaining.length > 0) {
      await addressRepository.setDefault(userId, remaining[0].id);
    }
  }
}

export async function setDefaultAddress(
  userId: string,
  addressId: string,
): Promise<void> {
  const existing = await addressRepository.findById(addressId);
  if (!existing || existing.userId !== userId) return;
  await addressRepository.setDefault(userId, addressId);
}
