import type { Metadata } from "next";

// metadataBase here so root-level routes (opengraph-image, not-found) resolve
// absolute social-image URLs. Per-locale metadata lives in app/[locale]/layout.tsx.
export const metadata: Metadata = {
  metadataBase: new URL("https://samirkapsalon.nl"),
};

// Root layout is intentionally minimal. The real <html>/<body>, fonts, and
// metadata live in app/[locale]/layout.tsx so <html lang> can switch per locale.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
