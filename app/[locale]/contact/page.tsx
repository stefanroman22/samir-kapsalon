import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { HoursTable } from "@/components/chrome/HoursTable";
import { MapCard } from "@/components/sections/MapCard";
import { RevealObserver } from "@/components/chrome/RevealObserver";
import { BUSINESS, BOOK_HREF } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/contact`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/contact`])),
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <>
      <section className="contact-hero">
        <div className="container contact-grid">
          <div className="contact-left reveal">
            <span className="eyebrow eyebrow--accent">{t("eyebrow")}</span>
            <h1 className="display contact-title">
              {t("titleLine1")}
              <br />
              <span className="text-accent">{t("titleLine2")}</span>
            </h1>

            <div className="contact-block mt-32">
              <span className="eyebrow">{t("addressLabel")}</span>
              <p className="contact-line">
                {BUSINESS.street}
                <br />
                {BUSINESS.postcode} {BUSINESS.city}
              </p>
              <a className="t-14 contact-act" href={BUSINESS.routeUrl} target="_blank" rel="noopener">
                {t("routeCta")}
              </a>
            </div>

            <div className="contact-block">
              <span className="eyebrow">{t("callLabel")}</span>
              <p className="contact-line">
                <a href={BUSINESS.phoneHref}>{BUSINESS.phoneDisplay}</a>
              </p>
              <span className="t-14 text-muted">{t("callNote")}</span>
            </div>

            <div className="contact-block">
              <span className="eyebrow">{t("followLabel")}</span>
              <p className="contact-line">
                <a href={BUSINESS.instagram} target="_blank" rel="noopener">
                  {t("igLink")}
                </a>
              </p>
            </div>

            <div className="contact-block">
              <span className="eyebrow">{t("parkingLabel")}</span>
              <p className="t-14 contact-line text-muted">{t("parkingBody")}</p>
            </div>

            <Link className="btn btn--accent btn--lg mt-32" href={BOOK_HREF}>
              {t("bookCta")}
            </Link>
          </div>

          <div className="contact-right reveal">
            <MapCard />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container hours-row">
          <div>
            <span className="eyebrow eyebrow--accent">{t("hoursEyebrow")}</span>
            <h2 className="display mt-16" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 0.95 }}>
              {t("hoursTitle")}
            </h2>
            <p className="lead mt-16">{t("hoursBody")}</p>
          </div>
          <HoursTable variant="big" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}
