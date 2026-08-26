import { cookies } from "next/headers";

import {
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "./jwt";
import type { UserRole } from "@/types/account";

// Sessão via cookie httpOnly assinado (JWT). Só é usada em Server
// Actions/Components (depende de next/headers).

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export async function createSession(userId: string, role: UserRole) {
  const token = await signSessionToken({ sub: userId, role });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
