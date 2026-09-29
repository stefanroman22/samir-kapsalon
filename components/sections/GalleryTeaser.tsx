import Image from "next/image";
import { getTranslations, getMessages } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { resolveSite } from "@/lib/cms-site";
import { RichText } from "@/lib/cms-rich-text";

export async function GalleryTeaser() {
  const t = await getTranslations("galleryTeaser");
  const alts = t.raw("alts") as string[];
  const { galleryTeaserImages } = resolveSite(await getMessages());

  return (
    <section className="section">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow"><RichText value={t.raw("eyebrow")} format="inline" /></span>
          <div className="section-head-row">
            <h2 className="display section-title">
              <RichText value={t.raw("titleLine1")} format="inline" />
              <br />
              <RichText value={t.raw("titleLine2")} format="inline" />
            </h2>
            <Link className="btn btn--ghost section-head-btn" href="/galerij">
              {t("all")}
            </Link>
          </div>
        </div>

        <div className="gallery-teaser mt-48">
          {galleryTeaserImages.map((src, i) => (
            <Link
              key={src + i}
              href="/galerij"
              className={`editorial gallery-${i + 1} reveal`}
              data-placeholder="true"
            >
              <Image
                src={src}
                alt={alts[i] ?? ""}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                style={{ objectFit: "cover" }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
