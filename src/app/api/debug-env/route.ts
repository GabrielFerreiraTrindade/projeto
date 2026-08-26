import { NextResponse } from "next/server";

// Rota de diagnóstico temporária: mostra só os NOMES das variáveis de
// ambiente presentes em tempo de execução (nunca os valores), pra
// descobrir por que DATABASE_URL não está chegando na Amplify. Remover
// depois de resolver.
export async function GET() {
  const keys = Object.keys(process.env)
    .filter((key) => !key.startsWith("AWS_") && !key.startsWith("_"))
    .sort();
  return NextResponse.json({ keys });
}
