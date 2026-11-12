import { getMessages, setRequestLocale } from "next-intl/server";
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
import { homePageOptions, pageSurface } from "@/lib/page-options";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // CMS display options (home_page_options, ADR-0013); defaults = the designed page.
  const options = homePageOptions(await getMessages());
  const surface = pageSurface(options);

  return (
    <div className={surface.className} style={surface.style}>
      <JsonLd data={hairSalonJsonLd(`https://samirkapsalon.nl/${locale}`)} />
      <Hero />
      <TrustBand />
      <ServicesTeaser />
      <AboutStrip imagePosition={options.about_image_position} />
      <GalleryTeaser />
      {options.show_reviews && <Reviews />}
      {options.show_instagram && <InstagramStrip />}
      <LocationStrip />
      <RevealObserver />
    </div>
  );
}
