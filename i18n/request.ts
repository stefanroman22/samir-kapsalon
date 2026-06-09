import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { withCmsContent } from "@/lib/cms-content";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Local messages are the seed/fallback (+ chrome). CMS-published content is merged
  // over them at request time so dashboard edits go live (see lib/cms-content.ts).
  const local = (await import(`../messages/${locale}.json`)).default;
  const messages = await withCmsContent(locale, local);

  return { locale, messages };
});
