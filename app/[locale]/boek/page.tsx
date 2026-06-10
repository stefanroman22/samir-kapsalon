import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { BookingForm } from "@/components/sections/BookingForm";

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

  // The booking shell is the whole screen — it has its own breadcrumb + step
  // headings, so no separate page header is rendered above it.
  return (
    <section className="section booking-app">
      <div className="container">
        <Suspense fallback={null}>
          <BookingForm />
        </Suspense>
      </div>
    </section>
  );
}
