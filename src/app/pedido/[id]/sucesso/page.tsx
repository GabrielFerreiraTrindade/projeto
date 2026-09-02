import type { Metadata } from "next";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { OrderDetail } from "@/components/account/order-detail";
import { Container } from "@/components/ui/container";
import { getCurrentUser } from "@/lib/services/auth-service";
import { getOrderByIdForUser } from "@/lib/services/order-service";

import { ClearCartOnMount } from "./clear-cart-on-mount";
import { PixPaymentStatus } from "./pix-payment-status";

export const metadata: Metadata = {
  title: "Pedido realizado",
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const order = await getOrderByIdForUser(id, user.id);
  if (!order) notFound();

  const payment = order.payment;
  const isPix = payment?.method === "PIX";
  const hasPixQrData = Boolean(
    payment?.pixQrCode && payment?.pixQrCodeUrl && payment?.pixExpiresAt,
  );

  return (
    <Container className="flex flex-col gap-8 py-8 sm:py-12">
      <ClearCartOnMount />

      {!isPix && (
        <div className="flex flex-col items-center gap-2 text-center">
          <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden />
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Pedido realizado com sucesso!
          </h1>
          <p className="text-sm text-muted-foreground">
            Número do pedido: <strong>{order.orderNumber}</strong>
          </p>
        </div>
      )}

      {isPix && payment && (
        <div className="mx-auto w-full max-w-md">
          {hasPixQrData && payment.pixQrCode && payment.pixQrCodeUrl && payment.pixExpiresAt ? (
            <PixPaymentStatus
              orderId={order.id}
              qrCode={payment.pixQrCode}
              qrCodeUrl={payment.pixQrCodeUrl}
              amount={Number(order.total)}
              expiresAt={payment.pixExpiresAt.toISOString()}
              initialStatus={payment.status}
            />
          ) : payment.status === "PAID" ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden />
              <p className="text-lg font-semibold text-foreground">
                Pagamento confirmado!
              </p>
            </div>
          ) : (
            // Nunca mostrar "confirmado" quando não temos QR code nem
            // confirmação real — nesse caso o gateway não devolveu os dados
            // do Pix (ver ProductSource/logs do provider configurado).
            <div className="flex flex-col items-center gap-2 rounded-xl border border-destructive p-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" aria-hidden />
              <p className="text-lg font-semibold text-foreground">
                Não conseguimos gerar o QR code Pix agora.
              </p>
              <p className="text-sm text-muted-foreground">
                Seu pedido foi registrado, mas o pagamento ainda está{" "}
                <strong>aguardando confirmação</strong>. Acompanhe o status em
                &quot;Meus Pedidos&quot; ou entre em contato com a loja.
              </p>
            </div>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Número do pedido: <strong>{order.orderNumber}</strong>
          </p>
        </div>
      )}

      <OrderDetail order={order} />
    </Container>
  );
}
