import type { Metadata } from "next";
import { getTranslations, getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { GalleryGrid } from "@/components/sections/GalleryGrid";
import { RevealObserver } from "@/components/chrome/RevealObserver";
import { resolveSite } from "@/lib/cms-site";
import { RichText } from "@/lib/cms-rich-text";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "galerij" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/galerij`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/galerij`])),
    },
  };
}

export default async function GalerijPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("galerij");
  const { galleryImages } = resolveSite(await getMessages());

  return (
    <>
      <section className="page-header">
        <div className="container page-header-row">
          <div>
            <span className="eyebrow eyebrow--accent"><RichText value={t.raw("eyebrow")} format="inline" /></span>
            <h1 className="display page-title">
              <RichText value={t.raw("titleLine1")} format="inline" />
              <br />
              <RichText value={t.raw("titleLine2")} format="inline" />
            </h1>
          </div>
          <p className="lead page-intro"><RichText value={t.raw("intro")} format="inline" /></p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <GalleryGrid
            images={galleryImages}
            labels={{
              close: t("lightboxClose"),
              prev: t("lightboxPrev"),
              next: t("lightboxNext"),
              dialog: t("lightboxDialog"),
              alt: t("imageAlt"),
            }}
          />
          <div className="gallery-caption mt-48 reveal">
            <span className="rule" aria-hidden="true" />
            <p className="t-14 text-muted" style={{ maxWidth: "56ch" }}>
              <RichText value={t.raw("caption")} format="inline" />
            </p>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}
