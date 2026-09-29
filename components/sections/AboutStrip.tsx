import Image from "next/image";
import { getTranslations, getMessages } from "next-intl/server";
import { resolveSite } from "@/lib/cms-site";
import { RichText } from "@/lib/cms-rich-text";

export async function AboutStrip() {
  const t = await getTranslations("about");
  const { aboutImages } = resolveSite(await getMessages());

  return (
    <section className="section about-strip">
      <div className="container about-grid">
        <div className="about-copy reveal">
          <span className="eyebrow"><RichText value={t.raw("eyebrow")} format="inline" /></span>
          <h2
            className="display section-title mt-16"
            style={{ fontSize: "clamp(32px, 4.2vw, 56px)" }}
          >
            <RichText value={t.raw("titleLine1")} format="inline" />
            <br />
            <RichText value={t.raw("titleLine2")} format="inline" />
          </h2>
          <RichText as="div" className="lead mt-24" value={t.raw("paragraph")} format="rich" />
          <div className="about-meta mt-32">
            <div>
              <span className="display about-stat">{t("stat1Value")}</span>
              <span className="t-12 eyebrow">{t("stat1Label")}</span>
            </div>
            <div>
              <span className="display about-stat">{t("stat2Value")}</span>
              <span className="t-12 eyebrow">{t("stat2Label")}</span>
            </div>
            <div>
              <span className="display about-stat">{t("stat3Value")}</span>
              <span className="t-12 eyebrow">{t("stat3Label")}</span>
            </div>
          </div>
        </div>

        <div className="about-images reveal">
          <div className="editorial ratio-45" data-placeholder="true">
            <Image
              src={aboutImages[0]}
              alt={t("img1Alt")}
              fill
              sizes="(max-width: 1024px) 60vw, 30vw"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="editorial ratio-11 about-img-2" data-placeholder="true">
            <Image
              src={aboutImages[1]}
              alt={t("img2Alt")}
              fill
              sizes="(max-width: 1024px) 30vw, 15vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
