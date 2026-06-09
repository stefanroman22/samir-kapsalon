import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["nl", "en"],
  defaultLocale: "nl",
  // /nl/diensten, /en/diensten — always prefixed for clean SEO + hreflang.
  localePrefix: "always",
});
