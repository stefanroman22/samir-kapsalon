import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { BUSINESS, INSTAGRAM_IMAGES } from "@/lib/site";

export async function InstagramStrip() {
  const t = await getTranslations("instagram");

  return (
    <section className="section section--tight ig-strip">
      <div className="container">
        <div className="ig-head reveal">
          <span className="eyebrow">{t("eyebrow")}</span>
          <a href={BUSINESS.instagram} target="_blank" rel="noopener" className="ig-handle">
            {t("handle")}
          </a>
        </div>
        <div className="ig-grid mt-32">
          {INSTAGRAM_IMAGES.map((src, i) => (
            <a
              key={src + i}
              className={`editorial ratio-11 reveal${i >= 4 ? " hide-mobile" : ""}`}
              data-placeholder="true"
              href={BUSINESS.instagram}
              target="_blank"
              rel="noopener"
            >
              <Image
                src={src}
                alt={t("alt")}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                style={{ objectFit: "cover" }}
              />
            </a>
          ))}
        </div>
        <div className="ig-foot mt-24">
          <a href={BUSINESS.instagram} target="_blank" rel="noopener">
            {t("follow")}
          </a>
        </div>
      </div>
    </section>
  );
}
