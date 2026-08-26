import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { getCurrentUser } from "@/lib/services/auth-service";
import { getOrderHistory } from "@/lib/services/order-history-service";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Meus pedidos",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/minha-conta/pedidos");

  const orders = await getOrderHistory(user.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
        Meus pedidos
      </h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
          <p className="font-semibold text-foreground">
            Você ainda não fez nenhum pedido
          </p>
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            Continuar comprando
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-col gap-3 rounded-xl border border-border p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link
                    href={`/minha-conta/pedidos/${order.id}`}
                    className="text-sm font-semibold text-foreground hover:underline"
                  >
                    Pedido #{order.orderNumber}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {order.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <ul className="flex flex-col gap-1 border-t border-border pt-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/pneu/${item.product.slug}`}
                      className="text-foreground hover:underline"
                    >
                      {item.quantity}x {item.product.name}
                    </Link>
                    <span className="text-muted-foreground">
                      {formatCurrency(Number(item.unitPrice) * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">
                  {order.payment
                    ? order.payment.method === "PIX"
                      ? "Pago via Pix"
                      : "Pago no cartão de crédito"
                    : "Pagamento"}
                </span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(Number(order.total))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
