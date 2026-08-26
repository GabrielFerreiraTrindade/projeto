import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/services/auth-service";

const ADMIN_NAV = [
  { label: "Pedidos", href: "/admin/pedidos" },
  { label: "Catálogo", href: "/admin/catalogo" },
  { label: "Importar produtos", href: "/admin/importar-produtos" },
  { label: "Fotos dos produtos", href: "/admin/fotos-produtos" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin");
  if (user.role !== "ADMIN") notFound();

  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-secondary">
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
