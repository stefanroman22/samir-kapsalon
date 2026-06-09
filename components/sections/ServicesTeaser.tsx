import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type ServiceItem = { name: string; desc: string; price: string; meta: string };

export async function ServicesTeaser() {
  const t = await getTranslations("servicesTeaser");
  const items = t.raw("items") as ServiceItem[];

  return (
    <section className="section">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">{t("eyebrow")}</span>
          <div className="section-head-row">
            <h2 className="display section-title">
              {t("titleLine1")}
              <br />
              <span className="text-accent">{t("titleLine2")}</span>
            </h2>
            <Link className="btn btn--ghost section-head-btn" href="/diensten">
              {t("all")}
            </Link>
          </div>
        </div>

        <ul className="service-rows">
          {items.map((item, i) => (
            <li key={item.name} className="service-row reveal">
              <span className="service-num">{String(i + 1).padStart(2, "0")}</span>
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
    </section>
  );
}
