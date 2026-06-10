"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { BUSINESS } from "@/lib/site";
import {
  getServices,
  getResources,
  getAvailability,
  createBooking,
  type Service,
  type Resource,
} from "@/lib/booking";

// Dynamic, backend-driven booking. Services, staff and per-barber availability are
// fetched live from the CMS booking API (see lib/booking.ts) so the form auto-adjusts
// when the owner adds/removes staff or services or changes the timetable. The flow is
// a Fresha/Treatwell-style two-column screen: the LEFT column holds the active step and
// scrolls; the RIGHT column is a sticky summary card whose primary "Doorgaan" action is
// always reachable. On mobile the summary collapses to a sticky bottom bar.
const STORE = "samir.booking";
const TZ = "Europe/Amsterdam"; // slot instants are UTC; display in the shop's timezone
const WINDOW_DAYS = 14;

// The backend now returns an optional EUR price per service. lib/booking.ts is
// generated/owned elsewhere, so we widen the type locally rather than editing it.
type PricedService = Service & { price?: number };

type State = {
  step: number;
  serviceId: string | null;
  barberId: string; // "" = no preference (server auto-assigns)
  date: string | null; // yyyy-mm-dd (shop-local)
  slot: string | null; // selected slot start_utc (ISO)
  name: string;
  phone: string;
  email: string;
  notes: string;
  ref: string | null;
  manageUrl: string | null;
};

const INITIAL: State = {
  step: 1,
  serviceId: null,
  barberId: "",
  date: null,
  slot: null,
  name: "",
  phone: "",
  email: "",
  notes: "",
  ref: null,
  manageUrl: null,
};

/** yyyy-mm-dd for a UTC instant, in the shop timezone. */
function shopDate(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function shopTime(iso: string, dateLocale: string): string {
  return new Intl.DateTimeFormat(dateLocale, {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** €-format an optional price. Whole numbers show no decimals; otherwise 2dp. */
function fmtPrice(price?: number): string | null {
  if (price == null || Number.isNaN(price)) return null;
  const body = Number.isInteger(price) ? String(price) : price.toFixed(2);
  return `€ ${body}`;
}

/** A field label from i18n, with any baked-in required/optional marker stripped so
 *  THIS component decides the indicator (email now required, phone now optional). */
function baseLabel(raw: string): string {
  return raw.replace(/\s*[*(].*$/, "").trim();
}

/** Extract a parenthetical "(optional)" / "(optioneel)" suffix from a label so the
 *  locale's own wording can be reused on another field (no new i18n key needed). */
function optionalMarker(raw: string): string {
  return raw.match(/\([^)]*\)\s*$/)?.[0]?.trim() ?? "";
}

/** Track the mobile breakpoint (<768px) so we can switch between the desktop
 *  two-column layout (sticky summary) and the mobile one-step-with-bottom-bar flow. */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

// --- small inline icons (stroke = currentColor, sized via CSS) --------------------
const IconBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const IconCal = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export function BookingForm() {
  const t = useTranslations("booking");
  const dateLocale = t("dateLocale");
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();
  // Reuse the locale's own "(optional)" wording (from the email label) on phone.
  const optionalSuffix = optionalMarker(t("emailLabel"));

  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<State>(INITIAL);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});
  // Submit lifecycle for the confirm-step overlay: idle → submitting → success.
  const [phase, setPhase] = useState<"idle" | "submitting" | "success">("idle");
  const [submitError, setSubmitError] = useState(false);

  // Backend data
  const [services, setServices] = useState<PricedService[] | null>(null);
  const [resources, setResources] = useState<Resource[] | null>(null);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [slotsByDate, setSlotsByDate] = useState<Record<string, string[]> | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const patch = useCallback((p: Partial<State>) => setState((s) => ({ ...s, ...p })), []);

  // Restore persisted draft after mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE);
      if (raw) setState({ ...INITIAL, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      sessionStorage.setItem(STORE, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, mounted]);

  // Load services once on mount.
  useEffect(() => {
    let alive = true;
    getServices()
      .then((s) => alive && setServices(s as PricedService[]))
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
    };
  }, []);

  const service = services?.find((s) => s.id === state.serviceId) ?? null;
  const servicePrice = fmtPrice(service?.price);
  // "free" when the backend reports an explicit 0 price.
  const serviceIsFree = service != null && service.price === 0;

  // Load eligible barbers whenever the chosen service changes.
  useEffect(() => {
    if (!state.serviceId) {
      setResources(null);
      return;
    }
    let alive = true;
    setResourcesLoading(true);
    getResources(state.serviceId)
      .then((r) => alive && setResources(r))
      .catch(() => alive && setLoadError(true))
      .finally(() => alive && setResourcesLoading(false));
    return () => {
      alive = false;
    };
  }, [state.serviceId]);

  // Load availability whenever service or barber changes (the per-barber calendar).
  useEffect(() => {
    if (!state.serviceId) {
      setSlotsByDate(null);
      return;
    }
    let alive = true;
    setSlotsLoading(true);
    const now = new Date();
    const from = shopDate(now.toISOString());
    const to = shopDate(new Date(now.getTime() + WINDOW_DAYS * 86400_000).toISOString());
    getAvailability(state.serviceId, from, to, state.barberId || undefined)
      .then((days) => {
        if (!alive) return;
        const map: Record<string, string[]> = {};
        for (const d of days) {
          for (const slot of d.slots) {
            const key = shopDate(slot.start_utc);
            (map[key] ??= []).push(slot.start_utc);
          }
        }
        setSlotsByDate(map);
      })
      .catch(() => alive && setLoadError(true))
      .finally(() => alive && setSlotsLoading(false));
    return () => {
      alive = false;
    };
  }, [state.serviceId, state.barberId]);

  const availableDates = useMemo(
    () => (slotsByDate ? Object.keys(slotsByDate).sort() : []),
    [slotsByDate]
  );
  const daySlots = state.date && slotsByDate ? (slotsByDate[state.date] ?? []) : [];
  const barber = resources?.find((b) => b.id === state.barberId) ?? null;
  const barberName = state.barberId ? (barber?.name ?? "—") : t("noPreference");

  const goto = (step: number) => patch({ step });

  // --- end of the chosen slot, for the "{start}–{end}" summary line. ---------------
  const slotEndIso = useMemo(() => {
    if (!state.slot || !service) return null;
    return new Date(new Date(state.slot).getTime() + service.duration_min * 60_000).toISOString();
  }, [state.slot, service]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim());
  // Phone is OPTIONAL — only validate format when something was entered.
  const phoneEntered = state.phone.trim().length > 0;
  const phoneValid = !phoneEntered || /^[\d\s+\-()]{6,}$/.test(state.phone);
  // Per-step validity gates the sticky "Doorgaan" button.
  const can: Record<number, boolean> = {
    1: !!state.serviceId,
    2: !!state.serviceId, // a barber OR "no preference" (barberId "") is always valid
    3: !!state.slot,
    4: state.name.trim().length >= 2 && emailValid && phoneValid,
  };

  const validateContact = () => {
    const e: { name?: string; phone?: string; email?: string } = {};
    if (state.name.trim().length < 2) e.name = t("errName");
    if (!emailValid) e.email = "";
    if (!phoneValid) e.phone = t("errPhone");
    setErrors(e);
    return !e.name && !e.phone && emailValid;
  };

  const submit = async () => {
    if (!state.serviceId || !state.slot || phase !== "idle") return;
    setPhase("submitting");
    setSubmitError(false);
    try {
      const res = await createBooking({
        service_id: state.serviceId,
        resource_id: state.barberId || undefined,
        start_utc: state.slot,
        customer: {
          name: state.name.trim(),
          email: state.email.trim(),
          phone: state.phone.trim() || undefined,
          tz: TZ,
        },
        note: state.notes.trim() || undefined,
      });
      // Hold the green-check beat briefly before fading to the success screen,
      // unless the user prefers reduced motion (then advance immediately).
      setPhase("success");
      const reveal = () => {
        patch({
          ref: res.booking_id ?? null,
          manageUrl: res.manage_url ?? null,
          step: 5,
        });
        setPhase("idle");
      };
      if (reduce) reveal();
      else window.setTimeout(reveal, 900);
    } catch {
      setSubmitError(true);
      setPhase("idle");
    }
  };

  // ---- The shared "Doorgaan" advance: steps 1–3 just advance; step 4 submits. -----
  const doorgaan = () => {
    if (state.step === 4) {
      if (validateContact()) submit();
      return;
    }
    if (!can[state.step]) return;
    goto(state.step + 1);
  };

  const back = () => {
    if (state.step > 1) goto(state.step - 1);
  };

  // -------------------------------------------------------------------------------
  // BREADCRUMB STEPPER — Services › Professional › Tijd › Bevestig
  // active = bold/dark, completed = normal, upcoming = muted.
  // -------------------------------------------------------------------------------
  const crumbs = [
    t("crumbServices"),
    t("crumbProfessional"),
    t("crumbTime"),
    t("crumbConfirm"),
  ];

  const TopBar = (
    <div className="fr-topbar">
      <button
        type="button"
        className="fr-circle fr-back"
        aria-label={t("backAria")}
        onClick={back}
        hidden={state.step === 1 || state.step === 5}
      >
        <IconBack />
      </button>
      <nav className="fr-crumbs" aria-label={crumbs.join(" / ")}>
        {crumbs.map((c, i) => {
          const n = i + 1;
          const status =
            state.step === n ? "is-active" : state.step > n ? "is-done" : "is-upcoming";
          return (
            <span key={c} className="fr-crumb-item">
              <span className={`fr-crumb ${status}`} aria-current={state.step === n ? "step" : undefined}>
                {c}
              </span>
              {i < crumbs.length - 1 ? <span className="fr-crumb-sep" aria-hidden="true">›</span> : null}
            </span>
          );
        })}
      </nav>
      <Link className="fr-circle fr-close" href="/" aria-label={t("closeAria")}>
        <IconClose />
      </Link>
    </div>
  );

  // -------------------------------------------------------------------------------
  // STEP BODIES (left column content)
  // -------------------------------------------------------------------------------

  const step1Body = (
    <div className="fr-step">
      <header className="fr-step-head">
        <h2 className="display fr-step-title">{t("servicesHeading")}</h2>
        <p className="fr-step-sub eyebrow">{t("servicesSub")}</p>
      </header>
      {loadError && <p className="field-error">{t("submitError")}</p>}
      {!services && !loadError ? (
        <div className="fr-loading">…</div>
      ) : (
        <ul className="fr-svc-list">
          {services?.map((it) => {
            const selected = state.serviceId === it.id;
            const p = fmtPrice(it.price);
            const free = it.price === 0;
            return (
              <li key={it.id}>
                <button
                  type="button"
                  className={`fr-svc-card${selected ? " is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() =>
                    patch(
                      selected
                        ? { serviceId: null, date: null, slot: null }
                        : { serviceId: it.id, date: null, slot: null }
                    )
                  }
                >
                  <span className="fr-svc-main">
                    <span className="fr-svc-name">{it.name}</span>
                    <span className="fr-svc-dur">{it.duration_min} min</span>
                  </span>
                  <span className="fr-svc-foot">
                    <span className="display fr-svc-price">{free ? t("free") : p}</span>
                  </span>
                  <span className="fr-svc-toggle" aria-hidden="true">
                    {selected ? <IconCheck /> : <IconPlus />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const step2Body = (
    <div className="fr-step">
      <header className="fr-step-head">
        <h2 className="display fr-step-title">{t("professionalHeading")}</h2>
      </header>
      <ul className="fr-pro-list">
        <li>
          <button
            type="button"
            className={`fr-pro-card${state.barberId === "" ? " is-selected" : ""}`}
            aria-pressed={state.barberId === ""}
            onClick={() => patch({ barberId: "", date: null, slot: null })}
          >
            <span className="fr-avatar fr-avatar--any" aria-hidden="true">?</span>
            <span className="fr-pro-text">
              <span className="fr-pro-name">{t("barberAny")}</span>
              <span className="fr-pro-desc">{t("barberAnyDesc")}</span>
            </span>
            <span className={`fr-pill${state.barberId === "" ? " is-on" : ""}`}>
              {state.barberId === "" ? <IconCheck /> : null}
              {state.barberId === "" ? t("selectedAction") : t("selectAction")}
            </span>
          </button>
        </li>
        {resourcesLoading && <li className="fr-loading">…</li>}
        {resources?.map((b) => {
          const selected = state.barberId === b.id;
          return (
            <li key={b.id}>
              <button
                type="button"
                className={`fr-pro-card${selected ? " is-selected" : ""}`}
                aria-pressed={selected}
                onClick={() => patch({ barberId: b.id, date: null, slot: null })}
              >
                <span className="fr-avatar" aria-hidden="true">{b.name.charAt(0)}</span>
                <span className="fr-pro-text">
                  <span className="fr-pro-name">{b.name}</span>
                </span>
                <span className={`fr-pill${selected ? " is-on" : ""}`}>
                  {selected ? <IconCheck /> : null}
                  {selected ? t("selectedAction") : t("selectAction")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const step3Body = (
    <div className="fr-step">
      <header className="fr-step-head">
        <h2 className="display fr-step-title">{t("timeHeading")}</h2>
      </header>

      {/* Professional switcher — shows the chosen barber, lets them change. */}
      <div className="fr-pro-switch">
        <span className="fr-avatar fr-avatar--sm" aria-hidden="true">
          {state.barberId ? (barber?.name.charAt(0) ?? "?") : "?"}
        </span>
        <span className="fr-pro-switch-name">{barberName}</span>
        <button type="button" className="fr-link" onClick={() => goto(2)}>
          {t("changeProfessional")}
        </button>
      </div>

      <div className="fr-pick-label eyebrow">{t("pickDay")}</div>
      <div className="fr-date-strip">
        {slotsLoading && <div className="fr-loading">…</div>}
        {!slotsLoading && availableDates.length === 0 && (
          <div className="fr-empty">{t("closedLabel")}</div>
        )}
        {!slotsLoading &&
          availableDates.map((iso) => {
            const d = new Date(iso + "T00:00");
            const active = state.date === iso;
            return (
              <button
                key={iso}
                type="button"
                className={`fr-date${active ? " is-active" : ""}`}
                aria-pressed={active}
                onClick={() => patch({ date: iso, slot: null })}
              >
                <span className="fr-date-dow">{d.toLocaleDateString(dateLocale, { weekday: "short" })}</span>
                <span className="display fr-date-day">{d.getDate()}</span>
                <span className="fr-date-mon">{d.toLocaleDateString(dateLocale, { month: "short" })}</span>
              </button>
            );
          })}
      </div>

      <div className="fr-pick-label eyebrow mt-24">{t("pickTime")}</div>
      <ul className="fr-time-list">
        {!state.date ? (
          <li className="fr-empty">{t("pickDayFirst")}</li>
        ) : daySlots.length === 0 ? (
          <li className="fr-empty">{t("closedLabel")}</li>
        ) : (
          daySlots.map((iso) => {
            const active = state.slot === iso;
            return (
              <li key={iso}>
                <button
                  type="button"
                  className={`fr-time${active ? " is-active" : ""}`}
                  aria-pressed={active}
                  onClick={() => patch({ slot: iso })}
                >
                  {shopTime(iso, dateLocale)}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );

  const step4Body = (
    <div className="fr-step">
      <header className="fr-step-head">
        <h2 className="display fr-step-title">{t("detailsHeading")}</h2>
      </header>
      <div className="fr-form">
        <div className="field">
          <label className="field-label" htmlFor="f-name">{baseLabel(t("nameLabel"))} *</label>
          <input
            className="input" type="text" id="f-name" autoComplete="name"
            value={state.name} data-invalid={errors.name ? "true" : undefined}
            onChange={(e) => patch({ name: e.target.value })}
          />
          <span className="field-error">{errors.name ?? ""}</span>
        </div>
        <div className="field">
          {/* Email is REQUIRED here (strip the i18n "(optional)" marker, add "*"). */}
          <label className="field-label" htmlFor="f-email">{baseLabel(t("emailLabel"))} *</label>
          <input
            className="input" type="email" id="f-email" autoComplete="email" placeholder={t("emailPlaceholder")}
            value={state.email} data-invalid={errors.email != null ? "true" : undefined}
            onChange={(e) => patch({ email: e.target.value })}
          />
          <span className="field-error" />
        </div>
        <div className="field">
          {/* Phone is OPTIONAL: reuse the locale's own "(optional)" suffix. */}
          <label className="field-label" htmlFor="f-phone">{baseLabel(t("phoneLabel"))} {optionalSuffix}</label>
          <input
            className="input" type="tel" id="f-phone" autoComplete="tel" placeholder={t("phonePlaceholder")}
            value={state.phone} data-invalid={errors.phone ? "true" : undefined}
            onChange={(e) => patch({ phone: e.target.value })}
          />
          <span className="field-error">{errors.phone ?? ""}</span>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="f-notes">{t("notesLabel")}</label>
          <textarea
            className="textarea" id="f-notes" rows={3} placeholder={t("notesPlaceholder")}
            value={state.notes} onChange={(e) => patch({ notes: e.target.value })}
          />
        </div>
        <p className="fr-fineprint t-14 text-muted">{t("confirmNote")}</p>
        {submitError ? <p className="field-error">{t("submitError")}</p> : null}
      </div>
    </div>
  );

  const bodies: Record<number, ReactNode> = {
    1: step1Body, 2: step2Body, 3: step3Body, 4: step4Body,
  };

  // -------------------------------------------------------------------------------
  // SUMMARY CARD (right column on desktop). Business header → selected service →
  // date/time → total → Doorgaan. The same content drives the mobile bottom bar.
  // -------------------------------------------------------------------------------
  const doorgaanLabel = state.step === 4 ? t("confirmBtn") : t("doorgaan");
  const doorgaanDisabled = !can[state.step] || (state.step === 4 && phase !== "idle");

  const summaryCard = (
    <aside className="fr-summary" aria-label={t("summaryTitle")}>
      <div className="fr-summary-scroll">
        <div className="fr-biz">
          <span className="display fr-biz-name">{BUSINESS.wordmark}</span>
          <span className="fr-biz-rating">
            {BUSINESS.rating} <span className="fr-star" aria-hidden="true">★</span>{" "}
            <span className="text-muted">({BUSINESS.reviewCount})</span>
          </span>
          <span className="fr-biz-addr text-muted">{BUSINESS.street}, {BUSINESS.city}</span>
        </div>
        <hr className="fr-rule" />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={service ? service.id + barberName : "empty"}
            initial={{ opacity: 0, y: reduce ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -6 }}
            transition={{ duration: reduce ? 0.12 : 0.22, ease: [0.2, 0, 0, 1] }}
          >
            {service ? (
              <div className="fr-line">
                <div className="fr-line-main">
                  <span className="fr-line-name">{service.name}</span>
                  <span className="fr-line-sub text-muted">
                    {t("durationWith", { duration: service.duration_min, who: barberName })}
                  </span>
                </div>
                <span className="display fr-line-price">
                  {serviceIsFree ? t("free") : servicePrice}
                </span>
              </div>
            ) : (
              <p className="fr-empty-note text-muted">{t("summaryEmpty")}</p>
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {state.slot && slotEndIso ? (
            <motion.div
              key="when"
              className="fr-when"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: reduce ? 0.12 : 0.25, ease: [0.2, 0, 0, 1] }}
              style={{ overflow: "hidden" }}
            >
              <span className="fr-when-row">
                <span className="fr-when-ic" aria-hidden="true"><IconCal /></span>
                {new Date(state.slot).toLocaleDateString(dateLocale, {
                  weekday: "long", day: "numeric", month: "long",
                })}
              </span>
              <span className="fr-when-row">
                <span className="fr-when-ic" aria-hidden="true"><IconClock /></span>
                {t("slotRange", {
                  start: shopTime(state.slot, dateLocale),
                  end: shopTime(slotEndIso, dateLocale),
                  duration: service?.duration_min ?? 0,
                })}
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <hr className="fr-rule" />
        <div className="fr-total">
          <span className="fr-total-label">{t("total")}</span>
          <span className="display fr-total-value">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={service ? (serviceIsFree ? "free" : String(servicePrice)) : "none"}
                initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                transition={{ duration: reduce ? 0.1 : 0.2, ease: [0.2, 0, 0, 1] }}
                style={{ display: "inline-block" }}
              >
                {service ? (serviceIsFree ? t("free") : (servicePrice ?? "—")) : "—"}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      </div>

      <button
        type="button"
        className="btn btn--accent btn--lg btn--block fr-doorgaan"
        disabled={doorgaanDisabled}
        onClick={doorgaan}
      >
        {doorgaanLabel}
      </button>
    </aside>
  );

  // Mobile bottom bar: the running selection (service · barber · time) stays
  // visible at ALL times and fills in as the user picks — so on mobile you can
  // always see what you've chosen, including on the final step. Plus total + action.
  const mobileMetaBits: string[] = [];
  if (service && state.step >= 2) {
    mobileMetaBits.push(t("durationWith", { duration: service.duration_min, who: barberName }));
  }
  if (service && state.slot && slotEndIso) {
    const d = new Date(state.slot).toLocaleDateString(dateLocale, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    mobileMetaBits.push(`${d} ${shopTime(state.slot, dateLocale)}`);
  }
  const mobileMeta = mobileMetaBits.join(" · ");

  const mobileBar = (
    <div className="fr-bottombar">
      <AnimatePresence initial={false}>
        {service && (
          <motion.div
            key="picks"
            className="fr-bb-picks"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduce ? 0.12 : 0.22, ease: [0.2, 0, 0, 1] }}
            style={{ overflow: "hidden" }}
          >
            <span className="fr-bb-name">{service.name}</span>
            {mobileMeta && <span className="fr-bb-meta text-muted">{mobileMeta}</span>}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fr-bb-action">
        <div className="fr-bottombar-total">
          <span className="fr-bottombar-label">{t("total")}</span>
          <span className="display fr-bottombar-value">
            {service ? (serviceIsFree ? t("free") : (servicePrice ?? "—")) : "—"}
          </span>
        </div>
        <button
          type="button"
          className="btn btn--accent btn--lg fr-bottombar-btn"
          disabled={doorgaanDisabled}
          onClick={doorgaan}
        >
          {doorgaanLabel}
        </button>
      </div>
    </div>
  );

  // Success screen (terminal). Replaces the whole two-column body.
  const successScreen = (
    <div className="fr-success">
      <div className="success-mark" aria-hidden="true">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12.5l3 3 5-6" />
        </svg>
      </div>
      <h2 className="display fr-success-title">{t("successTitle")}</h2>
      <p className="lead mt-16">{t("successBody")}</p>
      <dl className="fr-success-list">
        <div><dt>{t("confService")}</dt><dd>{service?.name ?? "—"}</dd></div>
        <div><dt>{t("confBarber")}</dt><dd>{barberName}</dd></div>
        <div>
          <dt>{t("confWhen")}</dt>
          <dd>
            {state.slot
              ? `${new Date(state.slot).toLocaleDateString(dateLocale, { day: "numeric", month: "long" })} · ${shopTime(state.slot, dateLocale)}`
              : "—"}
          </dd>
        </div>
        <div><dt>{t("refLabel")}</dt><dd>{state.ref ?? "—"}</dd></div>
      </dl>
      {state.manageUrl ? (
        <p className="t-14 mt-16">
          <a href={state.manageUrl} target="_blank" rel="noopener"><strong>{t("confWhen")} ↗</strong></a>
        </p>
      ) : null}
      <div className="fr-success-actions">
        <Link className="btn btn--ghost" href="/">{t("toHome")}</Link>
        <button
          type="button" className="btn btn--accent"
          onClick={() => { setState({ ...INITIAL }); setErrors({}); setSubmitError(false); setPhase("idle"); }}
        >
          {t("another")}
        </button>
      </div>
    </div>
  );

  // Mobile step transition: fade + small vertical slide; reduced-motion → opacity only.
  const mobileVariants = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
      };

  // -------------------------------------------------------------------------------
  // SUBMIT OVERLAY — spinner → green-check morph (covers the screen during POST).
  // -------------------------------------------------------------------------------
  const submitOverlay = (
    <AnimatePresence>
      {phase !== "idle" && (
        <motion.div
          key="submit-overlay"
          className="submit-overlay"
          aria-live="polite"
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
        >
          <motion.div
            className="submit-overlay-inner"
            initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          >
            <div className={`submit-mark${phase === "success" ? " is-done" : ""}`} aria-hidden="true">
              <AnimatePresence mode="wait" initial={false}>
                {phase === "submitting" ? (
                  <motion.span
                    key="spin"
                    className="submit-spinner"
                    initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.2 }}
                  />
                ) : (
                  <motion.svg
                    key="check"
                    width="28" height="28" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 360, damping: 18 }}
                  >
                    <motion.path
                      d="M5 12.5l4.5 4.5L19 6.5"
                      initial={reduce ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.35, ease: [0.2, 0, 0, 1], delay: 0.05 }}
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>
            <p className="submit-status">
              {phase === "submitting" ? t("submitting") : t("successTitle")}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // -------------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------------
  if (state.step === 5) {
    return (
      <div className="fr-shell fr-shell--done">
        {successScreen}
      </div>
    );
  }

  return (
    <div className="fr-shell">
      {TopBar}

      {isMobile ? (
        // MOBILE: one step at a time (left content), sticky bottom bar for Total + action.
        <div className="fr-mobile">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={state.step}
              className="fr-mobile-step"
              variants={mobileVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: reduce ? 0.12 : 0.26, ease: [0.2, 0, 0, 1] }}
            >
              {bodies[state.step]}
            </motion.div>
          </AnimatePresence>
          {mobileBar}
        </div>
      ) : (
        // DESKTOP: two columns — left scrolls, right summary is sticky.
        <div className="fr-body">
          <div className="fr-left">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={state.step}
                variants={mobileVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: reduce ? 0.12 : 0.26, ease: [0.2, 0, 0, 1] }}
              >
                {bodies[state.step]}
              </motion.div>
            </AnimatePresence>
          </div>
          {summaryCard}
        </div>
      )}

      {submitOverlay}
    </div>
  );
}
