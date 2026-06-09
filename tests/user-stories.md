# User stories — Samir Kapsalon

Derived from `_design-manifest.json`. Each story maps to a test in `tests/e2e/site.spec.ts`.

## Navigation & i18n
- Visitor lands on `/` and is redirected to the default locale `/nl`.
- Every page renders (200) with a visible H1, in both `nl` and `en`.
- `<html lang>` matches the URL locale.
- Switching language preserves the current path (`/nl/diensten` → `/en/diensten`).
- hreflang alternates are present in the document head.

## Content integrity
- Home hero shows the headline and both CTAs.
- Diensten lists every service group with prices.
- No horizontal overflow at 375px on key pages.
- No console errors during home page load.

## Booking flow (/boek)
- Selecting a service enables Continue and advances to the barber step.
- The booking page hides the sticky mobile CTA (it would overlap the form).

## Coverage map
| Story | Spec test |
|---|---|
| Root redirect | `root redirects to default locale` |
| Page renders per locale | `renders <page> with H1 (<locale>)` |
| html lang | `html lang matches locale` |
| Language switch preserves path | `language switcher preserves the path` |
| hreflang | `hreflang alternates present` |
| No overflow 375 | `no horizontal overflow at 375 on <page>` |
| No console errors | `no console errors on home load` |
| Booking advances | `booking: selecting a service advances to barber step` |
