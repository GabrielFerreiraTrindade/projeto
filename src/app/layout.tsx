import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { WhatsAppFloatButton } from "@/components/layout/whatsapp-float-button";
import { siteConfig } from "@/lib/constants";
import { CartProvider } from "@/lib/cart/cart-context";
import { getCurrentUser } from "@/lib/services/auth-service";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Pneus para todo o estado de Minas Gerais`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Header user={user} />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppFloatButton />
        </CartProvider>
      </body>
    </html>
  );
}
