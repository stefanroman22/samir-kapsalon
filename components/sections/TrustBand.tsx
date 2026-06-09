import { getTranslations } from "next-intl/server";

export async function TrustBand() {
  const t = await getTranslations("trust");

  return (
    <section id="trust" className="trust-band">
      <div className="container trust-row">
        <span className="trust-stars" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M12 2l2.95 6.99L22 9.74l-5.4 4.74L18.18 22 12 18.27 5.82 22l1.58-7.52L2 9.74l7.05-.75z" />
          </svg>
        </span>
        <span className="trust-text">{t("rating")}</span>
        <span className="trust-sep">·</span>
        <span className="trust-text">{t("address")}</span>
        <span className="trust-sep hide-mobile">·</span>
        <span className="trust-text hide-mobile">{t("openToday")}</span>
      </div>
    </section>
  );
}
