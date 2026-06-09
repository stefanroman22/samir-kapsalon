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
  const t = await getTranslations("booking");

  return (
    <>
      <section className="boek-header">
        <div className="container">
          <span className="eyebrow eyebrow--accent">{t("headerEyebrow")}</span>
          <h1 className="display boek-title">
            {t("titleLine1")} <span className="text-accent">{t("titleLine2")}</span>
          </h1>
          <p className="lead mt-16">{t("intro")}</p>
        </div>
      </section>

      <section className="section booking-app">
        <div className="container">
          <Suspense fallback={null}>
            <BookingForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
