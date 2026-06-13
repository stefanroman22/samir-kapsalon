import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { BookingStrip } from "@/components/sections/BookingStrip";
import { RevealObserver } from "@/components/chrome/RevealObserver";
import { BOOK_HREF, TEAM } from "@/lib/site";
import { resolveSite } from "@/lib/cms-site";

type Props = { params: Promise<{ locale: string }> };
type Member = {
  role: string;
  bio: string;
  bookCta: string;
  portraitAlt: string;
  // CMS-driven (team_members repeater); fall back to the static TEAM constant.
  name?: string;
  portrait?: string;
  tags?: string[];
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "team" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/team`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/team`])),
    },
  };
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("team");
  const members = t.raw("members") as Member[];
  const { contact } = resolveSite(await getMessages());

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
          <div className="team-grid">
            {TEAM.map((person, i) => {
              const m = members[i];
              // name/portrait/tags are CMS-editable (team_members); fall back to the
              // static TEAM constant so the card never breaks if the CMS is absent.
              const name = m.name ?? person.name;
              const portrait = m.portrait ?? person.portrait;
              const tags = m.tags ?? person.tags;
              return (
                <article className="team-card reveal" key={person.barberKey}>
                  <div className="editorial team-portrait" data-placeholder="true">
                    <Image
                      src={portrait}
                      alt={m.portraitAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="team-index-row">
                    <span className="team-index display">{String(i + 1).padStart(2, "0")}</span>
                    <span className="t-12 eyebrow">{m.role}</span>
                  </div>
                  <h2 className="display team-name">{name}</h2>
                  <p className="t-16 text-muted team-bio">{m.bio}</p>
                  <ul className="team-tags">
                    {tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  <div className="team-actions">
                    <Link
                      href={{ pathname: BOOK_HREF, query: { barber: person.barberKey } }}
                      className="btn btn--accent btn--sm"
                    >
                      {m.bookCta}
                    </Link>
                    <a href={contact.instagram} target="_blank" rel="noopener" className="t-14">
                      {t("igLink")}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="team-careers mt-64 reveal">
            <span className="eyebrow">{t("careersEyebrow")}</span>
            <h3
              className="display mt-16"
              style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1, maxWidth: "22ch" }}
            >
              {t("careersTitle")}
            </h3>
            <p className="t-16 mt-16 text-muted" style={{ maxWidth: "56ch" }}>
              {t("careersBody")}
            </p>
            <a href={contact.instagram} target="_blank" rel="noopener" className="btn btn--ghost mt-24">
              {t("careersCta")}
            </a>
          </div>
        </div>
      </section>

      <BookingStrip titleKey="team" />
      <RevealObserver />
    </>
  );
}
