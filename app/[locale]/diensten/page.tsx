import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { PageHeader } from "@/components/sections/PageHeader";
import { BookingStrip } from "@/components/sections/BookingStrip";
import { RevealObserver } from "@/components/chrome/RevealObserver";

type Props = { params: Promise<{ locale: string }> };
type ServiceItem = { name: string; desc: string; meta: string; price: string };
type Group = { title: string; items: ServiceItem[] };
type Note = { eyebrow: string; title: string; body: string };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "diensten" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/diensten`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/diensten`])),
    },
  };
}

export default async function DienstenPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("diensten");
  const groups = t.raw("groups") as Group[];
  const notes = t.raw("notes") as Note[];

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} intro={t("intro")}>
        {t("titleLine1")}
        <br />
        {t("titleLine2")}
        <br />
        <span className="text-accent">{t("titleLine3")}</span>
      </PageHeader>

      <section className="section">
        <div className="container">
          {groups.map((group, gi) => (
            <div className="svc-group reveal" key={group.title}>
              <div className="svc-group-head">
                <span className="svc-group-num display">{String(gi + 1).padStart(2, "0")}</span>
                <h2 className="svc-group-title display">{group.title}</h2>
              </div>
              <ul className="service-rows">
                {group.items.map((item) => (
                  <li className="service-row" key={item.name}>
                    <div className="service-main">
                      <h3 className="service-name display">{item.name}</h3>
                      <p className="service-desc t-14 text-muted">{item.desc}</p>
                    </div>
                    <div className="service-pricegroup">
                      <span className="service-price">{item.price}</span>
                      <span className="service-meta text-muted">{item.meta}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--tight notes">
        <div className="container notes-grid">
          {notes.map((note) => (
            <div className="reveal" key={note.eyebrow}>
              <span className="eyebrow">{note.eyebrow}</span>
              <h3 className="display mt-16" style={{ fontSize: "32px", lineHeight: 1 }}>
                {note.title}
              </h3>
              <p className="t-16 mt-16 text-muted">{note.body}</p>
            </div>
          ))}
        </div>
      </section>

      <BookingStrip titleKey="default" />
      <RevealObserver />
    </>
  );
}
