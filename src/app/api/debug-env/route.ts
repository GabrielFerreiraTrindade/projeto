import { NextResponse } from "next/server";

import { RUNTIME_ENV } from "@/generated-runtime-env";

// Rota de diagnóstico temporária: mostra só os NOMES das variáveis de
// ambiente presentes em tempo de execução (nunca os valores), e quais
// chaves foram embutidas em generated-runtime-env.ts no build. Remover
// depois de resolver o problema de env vars na Amplify.
export async function GET() {
  const keys = Object.keys(process.env)
    .filter((key) => !key.startsWith("AWS_") && !key.startsWith("_"))
    .sort();

  return NextResponse.json({
    keys,
    runtimeEnvKeys: Object.keys(RUNTIME_ENV),
  });
}
