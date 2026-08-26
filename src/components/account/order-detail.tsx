import Link from "next/link";

import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatCurrency } from "@/lib/utils";
import type { OrderWithRelations } from "@/types/order";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de crédito",
  BOLETO: "Boleto",
  DIGITAL_WALLET: "Carteira digital",
};

export function OrderDetail({ order }: { order: OrderWithRelations }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Pedido #{order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            Feito em {order.createdAt.toLocaleDateString("pt-BR")}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <section className="rounded-xl border border-border p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Produtos</h2>
        <ul className="flex flex-col divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2 text-sm">
              <Link href={`/pneu/${item.product.slug}`} className="text-foreground hover:underline">
                {item.quantity}x {item.product.name}
              </Link>
              <span className="text-muted-foreground">
                {formatCurrency(Number(item.unitPrice) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-border p-5 text-sm">
          <h2 className="mb-1 text-sm font-semibold text-foreground">Endereço de entrega</h2>
          <p className="text-muted-foreground">
            {order.address.recipient} — {order.address.street}, {order.address.number}
            {order.address.complement && ` — ${order.address.complement}`},{" "}
            {order.address.neighborhood}, {order.address.city}/{order.address.state}
          </p>
        </section>

        <section className="rounded-xl border border-border p-5 text-sm">
          <h2 className="mb-1 text-sm font-semibold text-foreground">Entrega</h2>
          <p className="text-muted-foreground">
            {order.shipment
              ? `${order.shipment.method ?? ""} · ${order.shipment.carrier ?? ""}`.trim()
              : "—"}
          </p>
        </section>

        <section className="rounded-xl border border-border p-5 text-sm">
          <h2 className="mb-1 text-sm font-semibold text-foreground">Pagamento</h2>
          <p className="text-muted-foreground">
            {order.payment
              ? `${PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}${
                  order.payment.installments ? ` · ${order.payment.installments}x` : ""
                }`
              : "—"}
          </p>
        </section>

        <section className="flex flex-col gap-1 rounded-xl border border-border p-5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(Number(order.subtotal))}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-primary">
              <span>Desconto</span>
              <span>-{formatCurrency(Number(order.discount))}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Frete</span>
            <span>
              {Number(order.shippingCost) === 0
                ? "Grátis"
                : formatCurrency(Number(order.shippingCost))}
            </span>
          </div>
          <div className="mt-1 flex justify-between border-t border-border pt-2 font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(Number(order.total))}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
