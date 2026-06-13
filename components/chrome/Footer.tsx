import { getTranslations, getMessages } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HoursTable } from "./HoursTable";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NAV, BOOK_HREF } from "@/lib/site";
import { resolveSite } from "@/lib/cms-site";

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const { contact } = resolveSite(await getMessages());

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <span className="footer-wordmark">
              SAMIR<span style={{ color: "var(--accent)" }}>.</span>KAPSALON
            </span>
            <p className="t-14 mt-24" style={{ opacity: 0.6, maxWidth: "36ch" }}>
              {t("tagline")}
            </p>
          </div>

          <div className="footer-col">
            <h4>{t("visit")}</h4>
            <ul>
              {contact.addressLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
              <li>
                <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
              </li>
              <li>
                <a href={contact.instagram} target="_blank" rel="noopener">
                  {contact.instagramHandle}
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t("hoursTitle")}</h4>
            <HoursTable variant="short" />
          </div>

          <div className="footer-col">
            <h4>{t("pagesTitle")}</h4>
            <ul>
              {NAV.map((item) => (
                <li key={item.key}>
                  <Link href={item.href}>{nav(item.key)}</Link>
                </li>
              ))}
              <li>
                <Link href={BOOK_HREF}>{nav("book")} →</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>{t("copyright")}</span>
          <LanguageSwitcher />
          <span>{t("legal")}</span>
        </div>
      </div>
    </footer>
  );
}
