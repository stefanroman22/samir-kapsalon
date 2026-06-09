import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { TrustBand } from "@/components/sections/TrustBand";
import { ServicesTeaser } from "@/components/sections/ServicesTeaser";
import { AboutStrip } from "@/components/sections/AboutStrip";
import { GalleryTeaser } from "@/components/sections/GalleryTeaser";
import { Reviews } from "@/components/sections/Reviews";
import { InstagramStrip } from "@/components/sections/InstagramStrip";
import { LocationStrip } from "@/components/sections/LocationStrip";
import { RevealObserver } from "@/components/chrome/RevealObserver";
import { JsonLd } from "@/lib/seo/jsonld";
import { hairSalonJsonLd } from "@/lib/seo/hairSalon";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <JsonLd data={hairSalonJsonLd(`https://samirkapsalon.nl/${locale}`)} />
      <Hero />
      <TrustBand />
      <ServicesTeaser />
      <AboutStrip />
      <GalleryTeaser />
      <Reviews />
      <InstagramStrip />
      <LocationStrip />
      <RevealObserver />
    </>
  );
}
