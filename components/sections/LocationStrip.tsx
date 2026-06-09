import { getTranslations } from "next-intl/server";
import { HoursTable } from "@/components/chrome/HoursTable";
import { MapCard } from "@/components/sections/MapCard";
import { BUSINESS } from "@/lib/site";

export async function LocationStrip() {
  const t = await getTranslations("location");

  return (
    <section className="section location-strip">
      <div className="container location-grid">
        <div className="location-copy reveal">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 className="display mt-16" style={{ fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.95 }}>
            {t("streetLine")}
            <br />
            <span className="text-accent">{t("number")}</span>
          </h2>
          <p className="t-18 mt-16" style={{ opacity: 0.8 }}>
            {t("postcode")}
            <br />
            <a href={BUSINESS.phoneHref}>{t("phoneDisplay")}</a>
          </p>
          <div className="mt-24">
            <HoursTable variant="full" />
          </div>
        </div>

        <div className="reveal">
          <MapCard />
        </div>
      </div>
    </section>
  );
}
