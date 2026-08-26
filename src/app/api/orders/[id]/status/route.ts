import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/services/auth-service";
import { getOrderByIdForUser } from "@/lib/services/order-service";

// Usado pela página de sucesso do pedido para atualizar o status do Pix
// automaticamente (polling). Só lê do nosso banco — nunca chama o gateway
// direto do navegador.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderByIdForUser(id, user.id);
  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    orderStatus: order.status,
    paymentStatus: order.payment?.status ?? null,
  });
}
