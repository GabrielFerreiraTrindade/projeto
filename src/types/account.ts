// Tipos da conta do usuário. Agora que User/Address/PasswordResetToken são
// tabelas reais no Postgres, reaproveitamos os tipos gerados pelo Prisma em
// vez de manter uma cópia paralela que poderia divergir do schema.
import type {
  Address as PrismaAddress,
  PasswordResetToken as PrismaPasswordResetToken,
  User as PrismaUser,
} from "@prisma/client";

export type { UserRole } from "@prisma/client";
export type User = PrismaUser;
export type Address = PrismaAddress;
export type PasswordResetToken = PrismaPasswordResetToken;

export type PublicUser = Omit<PrismaUser, "passwordHash">;
