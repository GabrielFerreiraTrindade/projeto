import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import {
  clearSession,
  createSession,
  getSessionPayload,
} from "@/lib/auth/session";
import { isValidCpf, onlyDigits as onlyCpfDigits } from "@/lib/auth/cpf";
import { onlyDigits as onlyPhoneDigits } from "@/lib/auth/phone";
import { passwordResetRepository } from "@/lib/repositories/password-reset-repository";
import { userRepository, type NewUser } from "@/lib/repositories/user-repository";
import type { PublicUser, User } from "@/types/account";

// Camada de serviço da autenticação: validação, hashing de senha (bcrypt —
// a senha em texto puro nunca é persistida) e orquestração da sessão.
// Não sabe nada sobre React, formulários ou cookies HTTP diretamente (isso
// fica em src/lib/auth/session.ts).

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutos

function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...publicUser } = user;
  void passwordHash;
  return publicUser;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export type RegisterInput = {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
};

export type RegisterResult =
  { ok: true; user: PublicUser } | { ok: false; error: string };

export async function registerUser(
  input: RegisterInput,
): Promise<RegisterResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const cpf = onlyCpfDigits(input.cpf);
  const phone = onlyPhoneDigits(input.phone);

  if (name.length < 3) {
    return { ok: false, error: "Informe seu nome completo." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Informe um e-mail válido." };
  }
  if (!isValidCpf(cpf)) {
    return { ok: false, error: "Informe um CPF válido." };
  }
  if (phone.length < 10) {
    return { ok: false, error: "Informe um telefone válido, com DDD." };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "A senha precisa ter pelo menos 8 caracteres." };
  }

  if (await userRepository.findByEmail(email)) {
    return { ok: false, error: "Já existe uma conta com este e-mail." };
  }
  if (await userRepository.findByCpf(cpf)) {
    return { ok: false, error: "Já existe uma conta com este CPF." };
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const newUser: NewUser = {
    id: crypto.randomUUID(),
    name,
    email,
    cpf,
    phone,
    passwordHash,
    role: "CUSTOMER",
  };

  const user = await userRepository.create(newUser);
  await createSession(user.id, user.role);

  return { ok: true, user: toPublicUser(user) };
}

export type LoginResult =
  { ok: true; user: PublicUser } | { ok: false; error: string };

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResult> {
  const user = await userRepository.findByEmail(email.trim().toLowerCase());
  const genericError = "E-mail ou senha inválidos.";
  if (!user) return { ok: false, error: genericError };

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return { ok: false, error: genericError };

  await createSession(user.id, user.role);
  return { ok: true, user: toPublicUser(user) };
}

export async function logoutUser(): Promise<void> {
  await clearSession();
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const session = await getSessionPayload();
  if (!session) return null;

  const user = await userRepository.findById(session.sub);
  return user ? toPublicUser(user) : null;
}

export type UpdateProfileInput = {
  name: string;
  phone: string;
};

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<PublicUser | null> {
  const user = await userRepository.update(userId, {
    name: input.name.trim(),
    phone: onlyPhoneDigits(input.phone),
  });
  return user ? toPublicUser(user) : null;
}

export type PasswordResetRequestResult = {
  /**
   * Em produção este link seria enviado por e-mail. Sem serviço de e-mail
   * configurado nesta etapa, ele é devolvido para ser exibido na própria
   * tela (modo de desenvolvimento).
   */
  resetUrl: string;
} | null;

export async function requestPasswordReset(
  email: string,
  baseUrl: string,
): Promise<PasswordResetRequestResult> {
  const user = await userRepository.findByEmail(email.trim().toLowerCase());
  // Não revela se o e-mail existe ou não na base.
  if (!user) return null;

  const token = crypto.randomBytes(32).toString("hex");

  await passwordResetRepository.create({
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    usedAt: null,
  });

  return { resetUrl: `${baseUrl}/redefinir-senha?token=${token}` };
}

export type ResetPasswordResult = { ok: true } | { ok: false; error: string };

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<ResetPasswordResult> {
  if (newPassword.length < 8) {
    return { ok: false, error: "A senha precisa ter pelo menos 8 caracteres." };
  }

  const resetToken = await passwordResetRepository.findByTokenHash(
    hashToken(token),
  );

  if (
    !resetToken ||
    resetToken.usedAt ||
    new Date(resetToken.expiresAt) < new Date()
  ) {
    return { ok: false, error: "Link de recuperação inválido ou expirado." };
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.update(resetToken.userId, { passwordHash });
  await passwordResetRepository.markUsed(resetToken.id);

  return { ok: true };
}
