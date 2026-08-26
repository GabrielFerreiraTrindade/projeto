import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { OrderDetail } from "@/components/account/order-detail";
import { getCurrentUser } from "@/lib/services/auth-service";
import { getOrderByIdForUser } from "@/lib/services/order-service";

export const metadata: Metadata = {
  title: "Detalhes do pedido",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/minha-conta/pedidos");

  const { id } = await params;
  const order = await getOrderByIdForUser(id, user.id);
  if (!order) notFound();

  return <OrderDetail order={order} />;
}
