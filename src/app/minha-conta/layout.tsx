import { redirect } from "next/navigation";

import { AccountNav } from "@/components/account/account-nav";
import { Container } from "@/components/ui/container";
import { getCurrentUser } from "@/lib/services/auth-service";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/minha-conta");

  return (
    <Container className="grid grid-cols-1 gap-8 py-8 sm:py-12 lg:grid-cols-[240px_1fr]">
      <AccountNav userName={user.name.split(" ")[0]} />
      <div className="flex flex-col gap-6">{children}</div>
    </Container>
  );
}
