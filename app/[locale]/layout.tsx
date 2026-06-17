import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
    <html
      lang={locale}
      className={`${displayFont.variable} ${bodyFont.variable}`}
      // Browser page-translators (Google Translate, etc.) rewrite <html>'s lang/class,
      // which is an expected, unavoidable mismatch — silence the cosmetic warning here.
      suppressHydrationWarning
    >
      <body>
        {/* Translation resilience. In-browser translators (Google Translate, extensions)
            reparent text nodes into <font> wrappers. React's commit phase then calls
            removeChild/insertBefore against the node's ORIGINAL parent; the native call
            throws, and with no error boundary React escalates it to a full root unmount —
            the booking form vanishes when you e.g. switch barber. Guard both methods so a
            parent-mismatch still fulfils React's intent safely (detach from the real
            parent / append to the intended one) instead of throwing OR silently dropping
            the node. beforeInteractive runs before hydration, so the guard is in place
            before any update. React 19 never calls replaceChild, so it needs no guard.
            See facebook/react#11538. */}
        <Script id="translate-resilience" strategy="beforeInteractive">
          {`(function () {
  if (typeof Node !== "function" || !Node.prototype) return;
  var removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    // Translator moved \`child\` under a <font>: React wants it gone, so remove it from
    // its ACTUAL parent instead of throwing — leaving no stale duplicate text behind.
    if (child && child.parentNode !== this) {
      if (child.parentNode) child.parentNode.removeChild(child);
      return child;
    }
    return removeChild.apply(this, arguments);
  };
  var insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    // The reference sibling was reparented by the translator. Don't drop \`newNode\`
    // (that blanks the UI while React believes it mounted) — append it to the intended
    // parent so it stays visible and fiber-consistent.
    if (referenceNode && referenceNode.parentNode !== this) return this.appendChild(newNode);
    return insertBefore.apply(this, arguments);
  };
})();`}
        </Script>
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
