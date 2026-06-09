import { BUSINESS, HERO_IMAGE } from "@/lib/site";

// schema.org HairSalon — legal name in `name`, public wordmark in `alternateName`.
// Hours/rating are PLACEHOLDER values per the brief; confirm before launch.
export function hairSalonJsonLd(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: BUSINESS.legalName,
    alternateName: BUSINESS.wordmark,
    image: HERO_IMAGE,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.street,
      postalCode: BUSINESS.postcode,
      addressLocality: BUSINESS.city,
      addressCountry: BUSINESS.country,
    },
    telephone: "+31243557011",
    url: baseUrl,
    priceRange: BUSINESS.priceRange,
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.geo.lat,
      longitude: BUSINESS.geo.lng,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "09:00", closes: "21:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "17:00" },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: BUSINESS.rating,
      reviewCount: BUSINESS.reviewCount,
    },
    sameAs: [BUSINESS.instagram],
  };
}
