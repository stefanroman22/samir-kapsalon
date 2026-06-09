import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { displayFont, bodyFont } from "@/lib/fonts";
import { PageLoader } from "@/components/chrome/PageLoader";
import { ScrollProgress } from "@/components/chrome/ScrollProgress";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { CookieStrip } from "@/components/chrome/CookieStrip";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    metadataBase: new URL("https://samirkapsalon.nl"),
    title: { default: t("homeTitle"), template: `%s — ${t("siteName")}` },
    description: t("homeDescription"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
        "x-default": "/nl",
      },
    },
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      title: t("homeTitle"),
      description: t("homeDescription"),
      locale,
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ed" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1a17" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        {/* Enable the scroll-reveal hidden state only when JS is active (set before paint). */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        <NextIntlClientProvider messages={messages}>
          <PageLoader />
          <ScrollProgress />
          <Header />
          {children}
          <Footer />
          <CookieStrip />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
