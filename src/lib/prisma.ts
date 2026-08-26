import { PrismaClient } from "@prisma/client";

// Evita múltiplas instâncias do Prisma Client em hot-reload no desenvolvimento.
// https://pris.ly/d/help/next-js-best-practices
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
