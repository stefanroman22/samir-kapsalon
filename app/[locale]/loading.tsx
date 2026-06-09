import { getTranslations } from "next-intl/server";

// Shown by Next.js automatically while the next route segment under [locale]/
// is being fetched and rendered on client-side navigation. Covers the gap
// between clicking a nav link and the new page painting, so the visitor sees
// a spinner instead of a frozen UI. Header/Footer (from the locale layout)
// stay mounted around it.
export default async function Loading() {
  const t = await getTranslations("loader");
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <div className="route-loading-inner">
        <span className="route-loading-spinner" aria-hidden="true" />
        <span className="route-loading-text">{t("loading")}</span>
      </div>
    </div>
  );
}
