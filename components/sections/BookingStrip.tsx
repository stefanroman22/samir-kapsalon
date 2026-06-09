import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BOOK_HREF } from "@/lib/site";

// Charcoal CTA band shown at the foot of inner pages. `titleKey` selects the
// per-page headline from the `bookingStrip` namespace; CTA label is shared.
export async function BookingStrip({ titleKey = "default" }: { titleKey?: string }) {
  const t = await getTranslations("bookingStrip");
  return (
    <section className="booking-strip">
      <div className="container booking-strip-row">
        <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 72px)", lineHeight: 0.95 }}>
          {t(titleKey)}
        </h2>
        <Link className="btn btn--accent btn--lg" href={BOOK_HREF}>
          {t("cta")}
        </Link>
      </div>
    </section>
  );
}
