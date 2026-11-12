import { Suspense } from "react";
import type { Metadata } from "next";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { BookingForm } from "@/components/sections/BookingForm";
import { bookPageOptions, pageSurface } from "@/lib/page-options";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/boek`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/boek`])),
    },
  };
}

export default async function BoekPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  // CMS display options (book_page_options, ADR-0013); defaults = the designed page.
  const surface = pageSurface(bookPageOptions(await getMessages()));

  // The booking shell is the whole screen — it has its own breadcrumb + step
  // headings, so no separate page header is rendered above it.
  return (
    <div className={surface.className} style={surface.style}>
      <section className="section booking-app">
        <div className="container">
          <Suspense fallback={null}>
            <BookingForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
