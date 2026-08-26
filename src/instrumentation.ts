// A Amplify Hosting nao repassa as environment variables configuradas no
// console pro runtime do Lambda que atende as requisicoes (confirmado via
// /api/debug-env), e nem arquivos soltos extras sobrevivem ao reempacotamento
// que ela faz do build do Next.js. Por isso o proprio build (ver amplify.yml,
// raiz do repo) sobrescreve src/generated-runtime-env.ts com os valores reais
// ANTES de rodar `next build` - assim eles ficam embutidos no JS compilado do
// servidor, que e garantidamente incluido no pacote do Lambda. Aqui a gente
// só copia esses valores pra process.env assim que o servidor sobe, antes de
// qualquer consulta ao banco.
import { RUNTIME_ENV } from "@/generated-runtime-env";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  for (const [key, value] of Object.entries(RUNTIME_ENV)) {
    if (!process.env[key] && value) {
      process.env[key] = value;
    }
  }
}
