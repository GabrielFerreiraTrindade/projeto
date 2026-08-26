import { SignJWT, jwtVerify } from "jose";

import type { UserRole } from "@/types/account";

// Assinatura/verificação do token de sessão (JWT). Compatível com o runtime
// Edge (usa apenas `jose`, sem APIs específicas do Node) para poder rodar
// tanto em Server Actions/Components quanto no middleware.

export type SessionPayload = {
  sub: string;
  role: UserRole;
};

const SESSION_DURATION = "7d";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET não configurado. Defina essa variável de ambiente (veja .env.example).",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.sub !== "string" ||
      (payload.role !== "CUSTOMER" && payload.role !== "ADMIN")
    ) {
      return null;
    }
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}
