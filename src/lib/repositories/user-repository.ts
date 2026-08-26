import { prisma } from "@/lib/prisma";
import type { User } from "@/types/account";

// Camada de acesso a dados de usuários. Agora usa o PostgreSQL real via
// Prisma (model User) — antes da feature de checkout isto era um arquivo
// JSON local, trocado assim que o banco ficou disponível de verdade,
// mantendo a mesma assinatura para quem consome este repositório.

export type NewUser = Omit<User, "createdAt" | "updatedAt">;

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCpf(cpf: string): Promise<User | null>;
  create(user: NewUser): Promise<User>;
  update(id: string, patch: Partial<Omit<User, "id">>): Promise<User | null>;
}

class PrismaUserRepository implements UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async findByCpf(cpf: string) {
    return prisma.user.findUnique({ where: { cpf } });
  }

  async create(user: NewUser) {
    return prisma.user.create({ data: user });
  }

  async update(id: string, patch: Partial<Omit<User, "id">>) {
    try {
      return await prisma.user.update({ where: { id }, data: patch });
    } catch {
      return null;
    }
  }
}

export const userRepository: UserRepository = new PrismaUserRepository();
