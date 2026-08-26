import { prisma } from "@/lib/prisma";
import type { Address } from "@/types/account";

// Agora usa o PostgreSQL real via Prisma (model Address).

export type NewAddress = Omit<Address, "createdAt">;

export interface AddressRepository {
  findByUserId(userId: string): Promise<Address[]>;
  findById(id: string): Promise<Address | null>;
  create(address: NewAddress): Promise<Address>;
  update(
    id: string,
    patch: Partial<Omit<Address, "id" | "userId">>,
  ): Promise<Address | null>;
  remove(id: string): Promise<void>;
  setDefault(userId: string, id: string): Promise<void>;
}

class PrismaAddressRepository implements AddressRepository {
  async findByUserId(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  async findById(id: string) {
    return prisma.address.findUnique({ where: { id } });
  }

  async create(address: NewAddress) {
    return prisma.address.create({ data: address });
  }

  async update(id: string, patch: Partial<Omit<Address, "id" | "userId">>) {
    try {
      return await prisma.address.update({ where: { id }, data: patch });
    } catch {
      return null;
    }
  }

  async remove(id: string) {
    await prisma.address.delete({ where: { id } }).catch(() => null);
  }

  async setDefault(userId: string, id: string) {
    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      prisma.address.update({ where: { id }, data: { isDefault: true } }),
    ]);
  }
}

export const addressRepository: AddressRepository = new PrismaAddressRepository();
