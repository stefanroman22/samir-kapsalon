import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const base = "https://samirkapsalon.nl";

const paths = [
  { path: "", priority: 1.0 },
  { path: "/diensten", priority: 0.8 },
  { path: "/team", priority: 0.6 },
  { path: "/galerij", priority: 0.6 },
  { path: "/contact", priority: 0.6 },
  { path: "/boek", priority: 0.9 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    paths.map(({ path, priority }) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${base}/${l}${path}`]),
        ),
      },
    })),
  );
}
