import { prisma } from "@/lib/prisma";
import type { PasswordResetToken } from "@/types/account";

// Agora usa o PostgreSQL real via Prisma (model PasswordResetToken).

export type NewPasswordResetToken = Omit<PasswordResetToken, "createdAt">;

export interface PasswordResetRepository {
  create(token: NewPasswordResetToken): Promise<PasswordResetToken>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  markUsed(id: string): Promise<void>;
}

class PrismaPasswordResetRepository implements PasswordResetRepository {
  async create(token: NewPasswordResetToken) {
    return prisma.passwordResetToken.create({ data: token });
  }

  async findByTokenHash(tokenHash: string) {
    return prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  }

  async markUsed(id: string) {
    await prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}

export const passwordResetRepository: PasswordResetRepository =
  new PrismaPasswordResetRepository();
