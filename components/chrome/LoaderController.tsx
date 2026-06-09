"use client";

import { useEffect } from "react";

// Drives the initial-access splash. The markup is rendered server-side by
// PageLoader and is NOT owned by React, so this controller mutates it
// imperatively via [data-state] — first show on a fresh document load, then
// swap to the "ready" copy, then dissolve away. A pre-paint script (in
// PageLoader) hides it instantly for repeat visits this session, so this only
// runs the full sequence on the genuine first entry. prefers-reduced-motion is
// handled in globals.css.
const SESSION_KEY = "sk:loader-shown";

const MIN_VISIBLE = 1400; // ms since navigation start — give the spinner room to spin
const DONE_HOLD = 1300; // linger on the filled-circle + check so it reads as "done"
const EXIT = 600; // must stay >= the CSS exit transition on .page-loader
const MAX_WAIT = 4500; // safety: never trap the user if `load` is slow

export function LoaderController() {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".page-loader");
    if (!el) return;
    // Already hidden by the pre-paint script (repeat visit this session).
    if (el.getAttribute("data-state") === "off") return;

    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode — fall through, splash still works for this load */
    }

    let cancelled = false;
    const timers: number[] = [];
    const after = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, ms));

    const reveal = (state: "done" | "hide" | "off") => {
      if (!cancelled) el.setAttribute("data-state", state);
    };

    const finish = () => {
      if (cancelled) return;
      // Announce the ready copy to screen readers as it fades in.
      el.querySelector(".loader-text--loading")?.setAttribute("aria-hidden", "true");
      el.querySelector(".loader-text--done")?.removeAttribute("aria-hidden");
      reveal("done");
      after(DONE_HOLD, () => {
        reveal("hide");
        after(EXIT, () => reveal("off"));
      });
    };

    let started = false;
    const onReady = () => {
      if (started || cancelled) return;
      started = true;
      // performance.now() is measured from navigation start, so this enforces a
      // minimum on-screen time regardless of when hydration happened.
      after(Math.max(0, MIN_VISIBLE - performance.now()), finish);
    };

    if (document.readyState === "complete") {
      onReady();
    } else {
      window.addEventListener("load", onReady, { once: true });
      after(MAX_WAIT, onReady);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", onReady);
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return null;
}
