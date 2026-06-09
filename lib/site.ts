// Locale-independent site data (business facts, routes, hours, mock imagery).
// PLACEHOLDER values per the design brief (hours, prices, photos) — replace before launch.

export const BUSINESS = {
  legalName: "hairdresser Samir",
  wordmark: "SAMIR KAPSALON",
  phoneDisplay: "024 355 7011",
  phoneHref: "tel:+31243557011",
  instagram: "https://www.instagram.com/samirkapsalon.nijmegen/",
  instagramHandle: "@samirkapsalon.nijmegen",
  street: "Groenestraat 277",
  postcode: "6531 HK",
  city: "Nijmegen",
  country: "NL",
  geo: { lat: 51.8314177, lng: 5.8438964 },
  rating: "4.8",
  reviewCount: "105",
  priceRange: "€€",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=hairdresser+Samir+Groenestraat+277+Nijmegen",
  routeUrl: "https://maps.google.com/?q=Groenestraat+277,+Nijmegen",
} as const;

// Route segments (Dutch URLs per the brief). next-intl Link auto-prefixes the locale.
export const NAV = [
  { key: "home", href: "/" },
  { key: "services", href: "/diensten" },
  { key: "team", href: "/team" },
  { key: "gallery", href: "/galerij" },
  { key: "contact", href: "/contact" },
] as const;

export const BOOK_HREF = "/boek";

// Hours: index 0 = Monday … 6 = Sunday. `time` null = closed.
// `messageKey`/`shortKey` map into messages.hours.*
export const HOURS = [
  { messageKey: "mon", shortKey: "monShort", time: "09:00 — 18:00", short: "09 — 18" },
  { messageKey: "tue", shortKey: "tueShort", time: "09:00 — 18:00", short: "09 — 18" },
  { messageKey: "wed", shortKey: "wedShort", time: "09:00 — 18:00", short: "09 — 18" },
  { messageKey: "thu", shortKey: "thuShort", time: "09:00 — 21:00", short: "09 — 21" },
  { messageKey: "fri", shortKey: "friShort", time: "09:00 — 18:00", short: "09 — 18" },
  { messageKey: "sat", shortKey: "satShort", time: "09:00 — 17:00", short: "09 — 17" },
  { messageKey: "sun", shortKey: "sunShort", time: null, short: null },
] as const;

// Booking: opening windows for slot generation (index 0 = Monday … 6 = Sunday).
export const OPENING_HOURS = [
  { open: "09:00", close: "18:00" },
  { open: "09:00", close: "18:00" },
  { open: "09:00", close: "18:00" },
  { open: "09:00", close: "21:00" },
  { open: "09:00", close: "18:00" },
  { open: "09:00", close: "17:00" },
  null,
] as const;

// Bookable services (locale-independent ids/minutes/price). Names + meta are localized
// in messages.booking.serviceNames / serviceMeta, keyed by id.
export const BOOKING_SERVICES = [
  {
    group: "cuts",
    items: [
      { id: "cut-adult", mins: 30, price: 25 },
      { id: "cut-kid", mins: 25, price: 18 },
      { id: "cut-senior", mins: 30, price: 22 },
    ],
  },
  {
    group: "beard",
    items: [
      { id: "beard-trim", mins: 20, price: 15 },
      { id: "beard-shave", mins: 35, price: 25 },
      { id: "shave-classic", mins: 45, price: 30 },
    ],
  },
  {
    group: "combo",
    items: [
      { id: "combo-cut-beard", mins: 50, price: 35 },
      { id: "combo-cut-shave", mins: 60, price: 45 },
      { id: "combo-full", mins: 75, price: 55 },
    ],
  },
] as const;

export const BARBER_PORTRAITS = {
  samir: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80&auto=format&fit=crop",
  mehmet: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80&auto=format&fit=crop",
} as const;

// Editorial Unsplash photos used as v1 PLACEHOLDERS (kept as-is per the brief).
export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=2400&q=80&auto=format&fit=crop";

export const ABOUT_IMAGES = [
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=600&q=80&auto=format&fit=crop",
];

export const GALLERY_TEASER_IMAGES = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=600&q=80&auto=format&fit=crop",
];

// Team — dummy data per the brief (replace before launch). Names + specialty tags are
// literal (untranslated in the design); roles/bios are localized in messages.team.members.
export const TEAM = [
  {
    name: "Samir Yılmaz",
    barberKey: "samir",
    portrait: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1000&q=80&auto=format&fit=crop",
    tags: ["Klassieke scheerbeurt", "Hot towel", "Mes", "Senior knip"],
  },
  {
    name: "Mehmet Demir",
    barberKey: "mehmet",
    portrait: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1000&q=80&auto=format&fit=crop",
    tags: ["Moderne knip", "Fades", "Baardtrim", "Textured crop"],
  },
] as const;

// Gallery masonry — 14 editorial PLACEHOLDER images with varied row spans.
export const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80&auto=format&fit=crop", span: 26 },
  { src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80&auto=format&fit=crop", span: 18 },
  { src: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80&auto=format&fit=crop", span: 22 },
  { src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80&auto=format&fit=crop", span: 18 },
  { src: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=800&q=80&auto=format&fit=crop", span: 26 },
  { src: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=800&q=80&auto=format&fit=crop", span: 16 },
  { src: "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=800&q=80&auto=format&fit=crop", span: 22 },
  { src: "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=800&q=80&auto=format&fit=crop", span: 20 },
  { src: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800&q=80&auto=format&fit=crop", span: 28 },
  { src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80&auto=format&fit=crop&sat=-30", span: 18 },
  { src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80&auto=format&fit=crop&sat=-50", span: 24 },
  { src: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80&auto=format&fit=crop&sat=-40", span: 20 },
  { src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80&auto=format&fit=crop&sat=-50", span: 26 },
  { src: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=800&q=80&auto=format&fit=crop&sat=-30", span: 18 },
] as const;

export const INSTAGRAM_IMAGES = [
  "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=500&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=500&q=80&auto=format&fit=crop",
];
