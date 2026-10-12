import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    // The design uses editorial Unsplash photos as v1 PLACEHOLDERS.
    // Kept as-is per the design brief (commissioned photography is a launch blocker).
    // Images uploaded in the CMS dashboard are served from the CMS storage bucket.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "xeluydwpgiddbamysgyu.supabase.co",
        pathname: "/storage/v1/object/public/cms-files/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
