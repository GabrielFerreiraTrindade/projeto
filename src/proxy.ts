import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifySessionToken } from "@/lib/auth/jwt";

// Protege /minha-conta/**, /checkout e /admin/**. Roda no Edge, por isso a
// verificação do token (src/lib/auth/jwt.ts) usa só `jose`, sem APIs
// específicas do Node.
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Painel administrativo: exige role ADMIN. A checagem completa (e o que
  // mostrar) ainda acontece na página, isto aqui é a primeira barreira.
  if (request.nextUrl.pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/minha-conta/:path*", "/checkout", "/admin/:path*"],
};
