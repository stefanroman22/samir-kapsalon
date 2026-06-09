import { Anton } from "next/font/google";
import localFont from "next/font/local";

// Display: Anton (Google) — Druk-style condensed, the free fallback the brief names
// for "GT America Condensed". Single weight (400) by design.
export const displayFont = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

// Body: Switzer (Fontshare), self-hosted. The brief's free fallback for "Söhne".
export const bodyFont = localFont({
  src: [
    { path: "../app/fonts/switzer-400.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/switzer-500.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/switzer-600.woff2", weight: "600", style: "normal" },
    { path: "../app/fonts/switzer-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});
