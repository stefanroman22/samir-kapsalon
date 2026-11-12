/**
 * CMS display options (ADR-0013) for this site's pages.
 *
 * Each page has one `<page>_page_options` service in the CMS. `lib/cms-content.ts`
 * passes the raw services through the `site.pageOptions` messages namespace; the kit's
 * `readOptions` validates them here. The defaults below are the designed look, so a
 * page with no options service (or a missing/invalid value) renders exactly as before.
 *
 * Server Components: `homePageOptions(await getMessages())`.
 */
import type { CSSProperties } from "react";
import { contrastRatio, inkOn, readOptions, readableOn } from "@/lib/cms-rich-text";

/** How wide the page's text containers run (`.container`; the hero keeps its size).
 *  narrow   — 1024px
 *  standard — 1280px, `--container-max` (the original look on every page)
 *  wide     — 1600px
 *  full     — the whole screen (gutters kept) */
export type ContentWidth = "narrow" | "standard" | "wide" | "full";

export const HOME_PAGE_DEFAULTS = {
  background: "",
  content_width: "standard",
  /** About band: right (images right of the text) | left | hidden */
  about_image_position: "right",
  show_reviews: true,
  show_instagram: true,
};

export const SERVICES_PAGE_DEFAULTS = {
  background: "",
  content_width: "standard",
  /** The notes band (payment / walk-in notes) below the price list. */
  card_background: "",
  show_booking_strip: true,
};

export const TEAM_PAGE_DEFAULTS = {
  background: "",
  content_width: "standard",
  show_careers: true,
  show_booking_strip: true,
};

export const GALLERY_PAGE_DEFAULTS = {
  background: "",
  content_width: "standard",
  show_caption: true,
};

export const CONTACT_PAGE_DEFAULTS = {
  background: "",
  content_width: "standard",
  /** right (map right of the details) | left | hidden */
  map_position: "right",
  show_hours: true,
};

export const BOOK_PAGE_DEFAULTS = {
  background: "",
  content_width: "standard",
};

export type HomePageOptions = typeof HOME_PAGE_DEFAULTS;
export type ServicesPageOptions = typeof SERVICES_PAGE_DEFAULTS;
export type TeamPageOptions = typeof TEAM_PAGE_DEFAULTS;
export type GalleryPageOptions = typeof GALLERY_PAGE_DEFAULTS;
export type ContactPageOptions = typeof CONTACT_PAGE_DEFAULTS;
export type BookPageOptions = typeof BOOK_PAGE_DEFAULTS;

/** The raw `<page>_page_options` service from the messages (see lib/cms-content.ts). */
function raw(messages: unknown, key: string): unknown {
  const site = (messages as Record<string, unknown> | null)?.site as Record<string, unknown> | undefined;
  return (site?.pageOptions as Record<string, unknown> | undefined)?.[key];
}

export function homePageOptions(messages: unknown): HomePageOptions {
  return readOptions(raw(messages, "home_page_options"), HOME_PAGE_DEFAULTS);
}

export function servicesPageOptions(messages: unknown): ServicesPageOptions {
  return readOptions(raw(messages, "services_page_options"), SERVICES_PAGE_DEFAULTS);
}

export function teamPageOptions(messages: unknown): TeamPageOptions {
  return readOptions(raw(messages, "team_page_options"), TEAM_PAGE_DEFAULTS);
}

export function galleryPageOptions(messages: unknown): GalleryPageOptions {
  return readOptions(raw(messages, "gallery_page_options"), GALLERY_PAGE_DEFAULTS);
}

export function contactPageOptions(messages: unknown): ContactPageOptions {
  return readOptions(raw(messages, "contact_page_options"), CONTACT_PAGE_DEFAULTS);
}

export function bookPageOptions(messages: unknown): BookPageOptions {
  return readOptions(raw(messages, "book_page_options"), BOOK_PAGE_DEFAULTS);
}

/** `--foreground` / `--background` / `--accent` of the light theme (globals.css), as hex. */
const SITE_INK = "#1b150f";
const SITE_PAPER = "#f3f1ee";
const SITE_ACCENT = "#8d5136";

/** Weights that reproduce `--muted-foreground` (ink at ~71%) and `--border` (ink at
 *  15%) over the designed background. */
const MUTED_WEIGHT = 0.71;
const LINE_WEIGHT = 0.15;

/** `ink` at `weight` painted over `background`. */
function blend(ink: string, background: string, weight: number): string {
  const channel = (i: number) =>
    Math.round(parseInt(ink.slice(i, i + 2), 16) * weight + parseInt(background.slice(i, i + 2), 16) * (1 - weight))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(1)}${channel(3)}${channel(5)}`;
}

/** The site's own ink or paper colour when one stays readable (4.5:1) on `background`, else black or white. */
function readableInk(background: string): string {
  return [SITE_INK, SITE_PAPER].find((c) => contrastRatio(background, c) >= 4.5) ?? inkOn(background, "#000000", "#ffffff");
}

/** Text tokens for one client colour: ink, muted ink (kept at 4.5:1), rule lines and accent text. */
function surfaceVars(prefix: string, background: string): Record<string, string> {
  const ink = readableInk(background);
  const muted = blend(ink, background, MUTED_WEIGHT);
  return {
    [`${prefix}-bg`]: background,
    [`${prefix}-ink`]: ink,
    [`${prefix}-muted`]: contrastRatio(muted, background) >= 4.5 ? muted : ink,
    [`${prefix}-line`]: blend(ink, background, LINE_WEIGHT),
    [`${prefix}-accent`]: readableOn(SITE_ACCENT, background, 4.5),
  };
}

/** Class + CSS variables that apply the client's options to a page wrapper (`.page-surface`).
 *  Mark the page's text band with `page-card` when the page has `card_background`.
 *  Colours apply to the light theme only — see "Client-chosen page colours" in globals.css. */
export function pageSurface(options: {
  background: string;
  content_width: string;
  card_background?: string;
}): { className: string; style: CSSProperties | undefined } {
  const { background, content_width: width, card_background: card = "" } = options;
  const classes = ["page-surface"];
  let vars: Record<string, string> = {};
  if (width === "narrow" || width === "wide" || width === "full") classes.push(`page-width-${width}`);
  if (background) {
    classes.push("page-custom-bg");
    vars = { ...vars, ...surfaceVars("--page", background) };
    // Not the site ink means a dark page: the transparent header (outside the page) switches to its solid look.
    if (vars["--page-ink"] !== SITE_INK) classes.push("page-custom-ink");
  }
  if (card) {
    classes.push("page-custom-card");
    vars = { ...vars, ...surfaceVars("--page-card", card) };
  }
  return {
    className: classes.join(" "),
    style: Object.keys(vars).length ? (vars as CSSProperties) : undefined,
  };
}
