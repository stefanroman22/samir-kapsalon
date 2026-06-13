"use client";

import { useEffect, useState } from "react";
import { useTranslations, useMessages } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NAV, BOOK_HREF } from "@/lib/site";
import { resolveSite } from "@/lib/cms-site";

export function Header() {
  const t = useTranslations("nav");
  const { contact } = resolveSite(useMessages());
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const wordmark = (
    <>
      SAMIR<span className="dot">.</span>KAPSALON
    </>
  );

  return (
    <>
      <header
        className="site-header"
        data-overlay={isHome ? "true" : undefined}
        data-scrolled={scrolled ? "true" : "false"}
      >
        <div className="container nav-row">
          <Link href="/" className="wordmark" aria-label={t("homeAria")}>
            {wordmark}
          </Link>

          <nav className="nav-center" aria-label={t("ariaMain")}>
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="nav-link"
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="nav-right">
            <LanguageSwitcher />
            <Link href={BOOK_HREF} className="btn btn--accent btn--sm btn-header-cta">
              {t("book")}
            </Link>
            <button
              type="button"
              className="menu-trigger"
              aria-label={t("openMenu")}
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-menu" data-open={open ? "true" : "false"} role="dialog" aria-label={t("menu")}>
        <div className="close-row">
          <span className="wordmark">{wordmark}</span>
          <button
            type="button"
            className="menu-close"
            aria-label={t("closeMenu")}
            onClick={() => setOpen(false)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>
        <nav className="mobile-menu-links" aria-label={t("menu")}>
          {NAV.map((item) => (
            <Link key={item.key} href={item.href} onClick={() => setOpen(false)}>
              {t(item.key)}
            </Link>
          ))}
          <Link href={BOOK_HREF} onClick={() => setOpen(false)}>
            {t("book")} →
          </Link>
        </nav>
        <div className="mobile-menu-lang">
          <LanguageSwitcher />
        </div>
        <div className="mobile-menu-footer">
          <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
          <a href={contact.instagram} target="_blank" rel="noopener">
            {contact.instagramHandle}
          </a>
          <span>{contact.addressLines.join(", ")}</span>
        </div>
      </div>
    </>
  );
}
