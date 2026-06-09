import { getTranslations } from "next-intl/server";
import { BUSINESS } from "@/lib/site";

// Shared map rectangle: detailed Nijmegen SVG + address pin card + the
// "Open in kaarten" button overlay. Used on /contact and at the bottom of the
// home page so both surfaces render exactly the same component. The CTA label
// comes from contact.mapOpen — the canonical translation for this button.
export async function MapCard() {
  const t = await getTranslations("contact");

  return (
    <div className="map-card map-card--big">
      <svg viewBox="0 0 600 760" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true">
        <rect width="600" height="760" fill="oklch(20% 0.015 60)" />
        <g stroke="oklch(96% 0.005 80 / 0.08)" strokeWidth="1" fill="none">
          <path d="M-20 100 L620 80" />
          <path d="M-20 180 L620 160" />
          <path d="M-20 260 L620 280" />
          <path d="M-20 360 L620 340" />
          <path d="M-20 440 L620 460" />
          <path d="M-20 540 L620 520" />
          <path d="M-20 640 L620 660" />
          <path d="M-20 720 L620 740" />
          <path d="M80 -20 L60 780" />
          <path d="M160 -20 L180 780" />
          <path d="M260 -20 L240 780" />
          <path d="M340 -20 L360 780" />
          <path d="M440 -20 L420 780" />
          <path d="M540 -20 L560 780" />
        </g>
        <g stroke="oklch(96% 0.005 80 / 0.18)" strokeWidth="2" fill="none">
          <path d="M-20 400 L620 390" />
          <path d="M310 -20 L290 780" />
        </g>
        <g fontFamily="Switzer, sans-serif" fontSize="9" fill="oklch(96% 0.005 80 / 0.30)" letterSpacing="0.16em">
          <text x="40" y="395">GROENESTRAAT →</text>
          <text x="320" y="200" transform="rotate(-2 320 200)">ST. ANNASTRAAT</text>
        </g>
        <g fill="oklch(96% 0.005 80 / 0.04)">
          <rect x="40" y="200" width="120" height="80" />
          <rect x="180" y="200" width="100" height="60" />
          <rect x="300" y="200" width="120" height="80" />
          <rect x="440" y="200" width="120" height="60" />
          <rect x="40" y="460" width="120" height="60" />
          <rect x="180" y="460" width="100" height="80" />
          <rect x="320" y="460" width="100" height="60" />
          <rect x="440" y="460" width="120" height="80" />
          <rect x="40" y="580" width="100" height="60" />
          <rect x="180" y="580" width="120" height="60" />
          <rect x="320" y="580" width="100" height="60" />
        </g>
        <rect x="430" y="560" width="130" height="100" fill="oklch(45% 0.06 145 / 0.15)" />
        <g transform="translate(300 400)">
          <circle r="80" fill="oklch(50% 0.09 45 / 0.10)" />
          <circle r="48" fill="oklch(50% 0.09 45 / 0.18)" />
          <circle r="24" fill="oklch(50% 0.09 45 / 0.30)" />
          <circle r="9" fill="oklch(50% 0.09 45)" />
          <path d="M0 -9 L0 -34" stroke="oklch(50% 0.09 45)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="0" cy="-38" r="3" fill="oklch(50% 0.09 45)" />
        </g>
      </svg>
      <div className="map-pin-card">
        <span className="t-12 eyebrow" style={{ color: "oklch(96% 0.005 80 / 0.55)" }}>
          {BUSINESS.wordmark}
        </span>
        <span className="t-14">
          {BUSINESS.street}, {BUSINESS.city}
        </span>
        <span className="t-12" style={{ color: "oklch(96% 0.005 80 / 0.55)" }}>
          {BUSINESS.geo.lat.toFixed(4)}, {BUSINESS.geo.lng.toFixed(4)}
        </span>
      </div>
      <a className="map-open-action" href={BUSINESS.routeUrl} target="_blank" rel="noopener">
        {t("mapOpen")}
      </a>
    </div>
  );
}
