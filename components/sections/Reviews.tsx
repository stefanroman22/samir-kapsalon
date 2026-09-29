import { getTranslations } from "next-intl/server";
import { BUSINESS } from "@/lib/site";
import { RichText } from "@/lib/cms-rich-text";

type Review = { text: string; author: string; when: string };

export async function Reviews() {
  const t = await getTranslations("reviews");
  const items = t.raw("items") as Review[];

  return (
    <section className="section reviews">
      <div className="container">
        <span className="eyebrow reveal"><RichText value={t.raw("eyebrow")} format="inline" /></span>
        <div className="reviews-grid">
          {items.map((r) => (
            <figure className="review reveal" key={r.author}>
              <span className="review-quote-mark display" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote className="review-text display"><RichText value={r.text} format="inline" /></blockquote>
              <figcaption className="review-cite">
                <span className="t-14">
                  <strong>{r.author}</strong> — <span>{r.when}</span>
                </span>
                <span className="review-stars">★★★★★</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="reviews-foot">
          <a
            className="reviews-foot-link t-14"
            href={BUSINESS.mapsUrl}
            target="_blank"
            rel="noopener"
          >
            {t("readAll")}
          </a>
          <span className="rule" aria-hidden="true" />
          <span className="display t-30">{t("score")}</span>
        </div>
      </div>
    </section>
  );
}
