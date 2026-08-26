import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { Container } from "@/components/ui/container";
import { getCurrentUser } from "@/lib/services/auth-service";
import { listAllOrders } from "@/lib/services/admin-order-service";
import { cn, formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Pedidos — Admin",
  robots: { index: false, follow: false },
};

const FILTERS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Aguardando pagamento", value: "PENDING" },
  { label: "Pagos", value: "PAID" },
  { label: "Em preparação", value: "PROCESSING" },
  { label: "Enviados", value: "SHIPPED" },
  { label: "Entregues", value: "DELIVERED" },
  { label: "Cancelados", value: "CANCELLED" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin/pedidos");
  if (user.role !== "ADMIN") notFound();

  const { status } = await searchParams;
  const activeStatus = (status as OrderStatus | undefined) ?? undefined;
  const orders = await listAllOrders(activeStatus);

  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
        Pedidos
      </h1>

      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive =
            filter.value === "all" ? !activeStatus : activeStatus === filter.value;
          const href =
            filter.value === "all" ? "/admin/pedidos" : `/admin/pedidos?status=${filter.value}`;
          return (
            <Link
              key={filter.value}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Produtos</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-medium text-foreground">
                  <Link href={`/minha-conta/pedidos/${order.id}`} className="hover:underline">
                    #{order.orderNumber}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {order.createdAt.toLocaleDateString("pt-BR")}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-foreground">{order.user.name}</div>
                  <div className="text-xs text-muted-foreground">{order.user.email}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {order.items.map((item) => `${item.quantity}x ${item.product.name}`).join(", ")}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {formatCurrency(Number(order.total))}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {order.payment ? `${order.payment.method} · ${order.payment.status}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Nenhum pedido encontrado para este filtro.
          </p>
        )}
      </div>
    </Container>
  );
}
