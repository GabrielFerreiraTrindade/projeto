// Roda no build da Amplify (ver amplify.yml), ANTES de `next build`.
// Sobrescreve src/generated-runtime-env.ts com os valores reais das env vars
// configuradas no console da Amplify, que nao chegam sozinhas no runtime do
// Lambda que atende as requisicoes (ver src/instrumentation.ts para o porque
// disso e como esses valores sao usados).
// eslint-disable-next-line @typescript-eslint/no-require-imports -- script Node.js simples, roda fora do bundle da aplicação (sem transpilação/ESM).
const fs = require("fs");

const KEYS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXT_PUBLIC_SITE_NAME",
  "NEXT_PUBLIC_SITE_URL",
  "PAYMENT_PROVIDER",
  "PAGARME_API_KEY",
  "NEXT_PUBLIC_PAGARME_PUBLIC_KEY",
  "PAGARME_WEBHOOK_USER",
  "PAGARME_WEBHOOK_PASSWORD",
  "PAYONPAG_API_SECRET",
  "PAYONPAG_WEBHOOK_SECRET",
  "NEXT_PUBLIC_MAX_INSTALLMENTS",
];

const values = {};
for (const key of KEYS) {
  if (process.env[key]) {
    values[key] = process.env[key];
  }
}

const content = `// Gerado pelo build da Amplify - nao editar, nao commitar valores reais.
export const RUNTIME_ENV: Record<string, string> = ${JSON.stringify(values)};
`;

fs.writeFileSync("src/generated-runtime-env.ts", content);
console.log("generated-runtime-env.ts keys:", Object.keys(values));
