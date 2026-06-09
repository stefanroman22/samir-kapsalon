import { getTranslations } from "next-intl/server";
import { LoaderController } from "./LoaderController";

// Full-screen splash shown on initial access. Server-rendered so it is opaque
// from the very first paint (no flash of the page underneath) and so its copy
// is in the visitor's active locale — which next-intl already resolves from the
// URL / saved NEXT_LOCALE cookie, i.e. the language a returning visitor chose
// before. The markup deliberately lives outside any client component so React
// never reconciles its [data-state]; the controller mutates it imperatively.
export async function PageLoader() {
  const t = await getTranslations("loader");

  return (
    <>
      <div className="page-loader" data-state="loading" role="status" aria-live="polite">
        <div className="loader-inner">
          <span className="loader-wordmark display" aria-hidden="true">
            Samir<span className="dot">.</span>
          </span>
          <span className="loader-spinner" aria-hidden="true">
            {/* Hidden until [data-state="done"], then strokes in as the ring fills. */}
            <svg
              className="loader-check"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.5 L10 17.5 L19 7" />
            </svg>
          </span>
          <p className="loader-status">
            <span className="loader-text loader-text--loading">{t("loading")}</span>
            <span className="loader-text loader-text--done" aria-hidden="true">
              {t("ready")}
            </span>
          </p>
        </div>
      </div>
      {/* Pre-paint: hide instantly for repeat visits this session (no flash).
          Runs during parse, right after the .page-loader element exists. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{if(sessionStorage.getItem('sk:loader-shown')){var l=document.currentScript.previousElementSibling;if(l&&l.classList&&l.classList.contains('page-loader'))l.setAttribute('data-state','off');}}catch(e){}",
        }}
      />
      <LoaderController />
    </>
  );
}
