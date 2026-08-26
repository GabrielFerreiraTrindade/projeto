"use client";

// Tokenização de cartão no navegador, direto na API do Pagar.me, usando
// somente a chave pública (nunca a secreta). O token vai para o nosso
// servidor no lugar do número do cartão — o backend nunca vê o cartão.
//
// Baseado exclusivamente em docs.pagar.me/reference/criar-token-cartão-1:
// POST https://api.pagar.me/core/v5/tokens?appId={chave pública}
// body: { type: "card", card: { number, holder_name, exp_month, exp_year, cvv } }

export type TokenizeCardInput = {
  number: string;
  holderName: string;
  expMonth: number;
  expYear: number;
  cvv: string;
};

export type TokenizeCardResult = {
  token: string;
  expiresAt: string;
};

export class CardTokenizationError extends Error {}

export async function tokenizeCard(
  input: TokenizeCardInput,
): Promise<TokenizeCardResult> {
  const publicKey = process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY;
  if (!publicKey) {
    throw new CardTokenizationError(
      "Pagamento com cartão não está configurado (chave pública ausente).",
    );
  }

  let response: Response;
  try {
    response = await fetch(
      `https://api.pagar.me/core/v5/tokens?appId=${encodeURIComponent(publicKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "card",
          card: {
            number: input.number.replace(/\s+/g, ""),
            holder_name: input.holderName,
            exp_month: input.expMonth,
            exp_year: input.expYear,
            cvv: input.cvv,
          },
        }),
      },
    );
  } catch {
    throw new CardTokenizationError(
      "Não conseguimos processar o pagamento agora. Tente novamente.",
    );
  }

  if (!response.ok) {
    throw new CardTokenizationError(
      "Não foi possível validar os dados do cartão. Confira as informações e tente novamente.",
    );
  }

  const json = (await response.json()) as { id: string; expires_at: string };
  return { token: json.id, expiresAt: json.expires_at };
}
