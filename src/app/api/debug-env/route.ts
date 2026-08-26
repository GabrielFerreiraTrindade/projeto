import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

// Rota de diagnóstico temporária: mostra só os NOMES das variáveis de
// ambiente presentes em tempo de execução (nunca os valores), e se o
// arquivo runtime-env.json gerado no build foi encontrado. Remover depois
// de resolver o problema de env vars na Amplify.
export async function GET() {
  const keys = Object.keys(process.env)
    .filter((key) => !key.startsWith("AWS_") && !key.startsWith("_"))
    .sort();

  const root = process.env.LAMBDA_TASK_ROOT ?? process.cwd();
  const candidates = [
    path.join(root, "runtime-env.json"),
    path.join(process.cwd(), "runtime-env.json"),
  ];
  const foundPath = candidates.find((candidate) => fs.existsSync(candidate));

  return NextResponse.json({
    keys,
    cwd: process.cwd(),
    lambdaTaskRoot: process.env.LAMBDA_TASK_ROOT ?? null,
    runtimeEnvFileFound: foundPath ?? null,
  });
}
