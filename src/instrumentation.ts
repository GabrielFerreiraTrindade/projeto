import fs from "node:fs";
import path from "node:path";

// A Amplify Hosting nao repassa as environment variables configuradas no
// console pro runtime do Lambda que atende as requisicoes (confirmado via
// /api/debug-env) - so ficam disponiveis durante o build. Por isso o
// proprio build (ver amplify.yml, raiz do repo) escreve um JSON com esses
// valores dentro de .next, e aqui a gente carrega esse arquivo na mao
// assim que o servidor sobe, antes de qualquer consulta ao banco.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const root = process.env.LAMBDA_TASK_ROOT ?? process.cwd();
  const candidates = [
    path.join(root, "runtime-env.json"),
    path.join(process.cwd(), "runtime-env.json"),
  ];

  const envFilePath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!envFilePath) return;

  const values = JSON.parse(fs.readFileSync(envFilePath, "utf-8")) as Record<string, string>;
  for (const [key, value] of Object.entries(values)) {
    if (!process.env[key] && value) {
      process.env[key] = value;
    }
  }
}
