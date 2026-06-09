"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  return (
    <div className="lang-switch" role="group" aria-label={t("ariaLang")}>
      {routing.locales.map((l, i) => (
        <span key={l} className="row items-center">
          {i > 0 && <span className="sep" aria-hidden="true">/</span>}
          <button
            type="button"
            aria-pressed={l === locale}
            onClick={() => router.replace(pathname, { locale: l })}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
