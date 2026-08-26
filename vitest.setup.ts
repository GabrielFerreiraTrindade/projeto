import "dotenv/config";

// Variáveis de ambiente usadas pelos testes (nunca valores reais). O
// DATABASE_URL vem do .env real (carregado por "dotenv/config" acima) —
// os testes rodam contra o mesmo Postgres de desenvolvimento, criando e
// limpando seus próprios registros (ver src/lib/test-utils/test-fixtures.ts).
process.env.AUTH_SECRET ??= "test-secret-not-for-production";
process.env.PAYMENT_PROVIDER ??= "pagarme";
process.env.PAGARME_API_KEY ??= "sk_test_0000000000000000";
process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY ??= "pk_test_0000000000000000";
process.env.PAGARME_WEBHOOK_USER ??= "webhook-test-user";
process.env.PAGARME_WEBHOOK_PASSWORD ??= "webhook-test-password";
process.env.NEXT_PUBLIC_SITE_URL ??= "http://localhost:3000";
