# BUILD_PLAN — Samir Kapsalon

Source: Claude Design export `haidresser-samir` (industrial-utilitarian barbershop, Nijmegen).
Stack: Next.js 16 · React 19 · Tailwind v4 · next-intl (nl default + en) · Motion (installed) · Playwright.
Output: `C:\Users\stefa\.gemini\antigravity\scratch\samir-kapsalon\` (sibling of "CMS - websites").

## Scope decision
Home-first checkpoint, then the remaining 5 pages. Booking backend = stubbed `/api/bookings`.

## Locales
- [x] nl (default) — full real copy from `data-nl`
- [x] en — full real copy from `data-en` (no placeholders; design shipped both)

## Foundation
- [x] Scaffold Next 16 + Tailwind v4 + TS
- [x] next-intl wiring (routing/request/navigation/middleware/next.config)
- [x] Fonts: Anton (Google) display + Switzer (self-hosted woff2) body
- [x] globals.css — full design token + component system ported
- [x] lib/site.ts (business facts, routes, hours, mock imagery)
- [x] messages/nl.json + messages/en.json (home + chrome)
- [x] .learnings/ seeded from learnings-template

## Shared chrome
- [x] Header — scroll state, overlay on home, nav, lang switch, mobile drawer
- [x] Footer — grid, hours (short), lang switch, pages
- [x] LanguageSwitcher (path-preserving)
- [x] HoursTable (today highlight, full + short variants)
- [x] MobileCta (sticky bottom; hidden on /boek)
- [x] CookieStrip (localStorage dismiss)
- [x] RevealObserver (scroll reveal, reduced-motion safe)

## Home page sections
- [x] Hero (full-bleed editorial + lower-third type)
- [x] Trust band
- [x] Services teaser (3 rows)
- [x] About strip (copy + stats + 2 images)
- [x] Gallery teaser (masonry grid)
- [x] Reviews (2 pull quotes, Google Maps link)
- [x] Instagram strip (6 tiles)
- [x] Location strip (address + hours + stylised map → /contact)

## SEO (Home)
- [x] Metadata API (title/description/canonical/hreflang/OG/twitter) in [locale]/layout
- [x] viewport export separate
- [x] JSON-LD HairSalon
- [x] opengraph-image.tsx (default OG)
- [x] sitemap.ts (home; expand per page)
- [x] robots.ts

## Verification (Home)
- [x] `npm run build` exits 0 (clean, no warnings after metadataBase + OG fixes)
- [x] Responsive sweep 375/768/1440 — no horizontal overflow (375:360≤375, 768:753≤768, 1440:1425≤1440)
- [x] a11y sanity (prod): all 14 imgs have alt, 0 buttons without name, single h1, html lang switches nl/en, focus-visible rings in CSS. (axe-core CLI not run — sandbox lacks browser driver; manual checks via Playwright instead.)
- [x] grep: zero framer-motion / next-i18next / react-i18next / raw <img>
- [x] Hydration verified in production server (dev HMR WebSocket is blocked in this sandbox, which stalls dev-only hydration; prod confirms header scroll-state + reveal observer fire correctly)
- [x] Both locales render real copy (NL "KLASSIEK VAKMANSCHAP." / EN "CLASSIC CRAFT."); today-row highlight works (Vrijdag)

## Remaining pages (after checkpoint) — DONE
- [x] /diensten — 4 grouped service categories (11 services) + 3 service notes + booking strip
- [x] /team — 2 barber cards (Samir Yılmaz, Mehmet Demir) w/ display:contents alignment + careers + ?barber deep-link
- [x] /galerij — 14-image masonry + keyboard lightbox (client)
- [x] /boek — 5-step booking form + success; hour-aware slots, validation, sessionStorage, ?barber prefill → POST /api/bookings (stub)
- [x] /contact — address blocks + big stylised map + hours--big table
- [x] Playwright E2E + per-locale smoke — 42 tests pass (chromium + mobile)
- [x] Sitemap expanded to all 6 routes × 2 locales with hreflang
- [x] Final build exits 0; grep gates clean (no framer-motion / wrong i18n / raw <img>)

## PLACEHOLDER — replace before launch
Photography (Unsplash mocks), opening hours, team names, service prices.
