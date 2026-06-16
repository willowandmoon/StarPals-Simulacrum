import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "es" | "en" | "pt")) notFound();
  const messages = await getMessages();
  return (
    <Providers locale={locale} messages={messages as Record<string, unknown>}>
      <Navbar />
      <main className="flex-1">{children}</main>
    </Providers>
  );
}
