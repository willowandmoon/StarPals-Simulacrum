import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "StarPals — Coleccionables",
  description: "Tu tienda de coleccionables de edición limitada",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const locale = h.get("x-next-intl-locale") ?? "es";
  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
