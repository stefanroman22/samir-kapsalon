import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BOOK_HREF, HERO_IMAGE } from "@/lib/site";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="hero" aria-label="Hero">
      <div className="hero-media editorial" data-placeholder="true">
        <Image
          src={HERO_IMAGE}
          alt={t("imageAlt")}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div className="hero-overlay" />
      </div>

      <div className="hero-content container">
        <span className="hero-meta eyebrow" style={{ color: "oklch(96% 0.005 80 / 0.75)" }}>
          {t("location")}
        </span>
        <h1 className="display hero-title">
          {t("titleLine1")}
          <br />
          <em className="hero-em">{t("titleLine2")}</em>
        </h1>
        <div className="hero-foot">
          <p className="hero-sub">{t("sub")}</p>
          <div className="hero-actions">
            <Link className="btn btn--accent btn--lg" href={BOOK_HREF}>
              {t("book")}
            </Link>
            <Link className="btn btn--ghost btn--lg" href="/diensten">
              {t("services")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
