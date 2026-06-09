import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GALLERY_TEASER_IMAGES } from "@/lib/site";

export async function GalleryTeaser() {
  const t = await getTranslations("galleryTeaser");
  const alts = t.raw("alts") as string[];

  return (
    <section className="section">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">{t("eyebrow")}</span>
          <div className="section-head-row">
            <h2 className="display section-title">
              {t("titleLine1")}
              <br />
              {t("titleLine2")}
            </h2>
            <Link className="btn btn--ghost section-head-btn" href="/galerij">
              {t("all")}
            </Link>
          </div>
        </div>

        <div className="gallery-teaser mt-48">
          {GALLERY_TEASER_IMAGES.map((src, i) => (
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
