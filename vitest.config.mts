import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
    // Estes são testes de integração contra o Postgres real de dev — rodar
    // arquivos em paralelo causa corrida entre a limpeza de um arquivo e os
    // testes de outro (mesmo prefixo de dados de teste).
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
