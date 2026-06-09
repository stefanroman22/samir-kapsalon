"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
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
// service → barber (or "no preference") → that barber's real free slots → details.
const STORE = "samir.booking";
const TZ = "Europe/Amsterdam"; // slot instants are UTC; display in the shop's timezone
const WINDOW_DAYS = 14;

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

export function BookingForm() {
  const t = useTranslations("booking");
  const dateLocale = t("dateLocale");

  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<State>(INITIAL);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Backend data
  const [services, setServices] = useState<Service[] | null>(null);
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
      .then((s) => alive && setServices(s))
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
    };
  }, []);

  const service = services?.find((s) => s.id === state.serviceId) ?? null;

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

  const goto = (step: number) => {
    patch({ step });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fmtWhen = () => (state.slot ? `${shopDate(state.slot)} · ${shopTime(state.slot, dateLocale)}` : "—");
  const barberName = state.barberId ? (barber?.name ?? "—") : t("barberAny");

  const phoneValid = /^[\d\s+\-()]{6,}$/.test(state.phone);
  const can: Record<number, boolean> = {
    1: !!state.serviceId,
    2: !!state.serviceId, // a barber OR "no preference" (barberId "") is always valid
    3: !!state.slot,
    4: state.name.trim().length >= 2 && phoneValid,
  };

  const validateContact = () => {
    const e: { name?: string; phone?: string } = {};
    if (state.name.trim().length < 2) e.name = t("errName");
    if (!phoneValid) e.phone = t("errPhone");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!state.serviceId || !state.slot) return;
    setSubmitting(true);
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
      patch({
        ref: res.booking_id ?? null,
        manageUrl: res.manage_url ?? null,
        step: 6,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const stepDefs = [
    { n: 1, label: t("stepService"), pick: service ? service.name : "—" },
    { n: 2, label: t("stepBarber"), pick: state.serviceId ? barberName : "—" },
    { n: 3, label: t("stepDatetime"), pick: fmtWhen() },
    { n: 4, label: t("stepDetails"), pick: state.name ? `${state.name}${state.phone ? " · " + state.phone : ""}` : "—" },
    { n: 5, label: t("stepConfirm"), pick: null },
  ];

  const confirmRows = (withRef: boolean) => (
    <dl className="confirm-list">
      <div><dt>{t("confService")}</dt><dd>{service?.name ?? "—"}</dd></div>
      <div><dt>{t("confBarber")}</dt><dd>{barberName}</dd></div>
      <div><dt>{t("confWhen")}</dt><dd>{fmtWhen()}</dd></div>
      {withRef ? (
        <div><dt>{t("refLabel")}</dt><dd>{state.ref ?? "—"}</dd></div>
      ) : (
        <>
          <div><dt>{t("confName")}</dt><dd>{state.name || "—"}</dd></div>
          <div><dt>{t("confPhone")}</dt><dd>{state.phone || "—"}</dd></div>
          <div><dt>{t("confEmail")}</dt><dd>{state.email || "—"}</dd></div>
          <div><dt>{t("confNotes")}</dt><dd>{state.notes || "—"}</dd></div>
        </>
      )}
    </dl>
  );

  return (
    <div className="booking-grid">
      <aside className="booking-side">
        <ol className="steps">
          {stepDefs.map((s) => (
            <li
              key={s.n}
              className={`step${state.step === s.n ? " is-active" : ""}${state.step > s.n ? " is-complete" : ""}`}
            >
              <span className="step-num">{String(s.n).padStart(2, "0")}</span>
              <span className="step-label">{s.label}</span>
              {s.pick !== null ? <span className="step-pick t-14 text-muted">{s.pick}</span> : null}
            </li>
          ))}
        </ol>
        <div className="side-help">
          <p className="t-14 text-muted">{t("sideHelp")}</p>
          <div className="side-help-row mt-16">
            <a href={BUSINESS.phoneHref} className="t-14"><strong>{BUSINESS.phoneDisplay}</strong></a>
            <a href={BUSINESS.instagram} target="_blank" rel="noopener" className="t-14">{t("sideIg")}</a>
          </div>
        </div>
      </aside>

      <div className="booking-main">
        {/* STEP 1 — service */}
        <section className="step-pane" hidden={state.step !== 1}>
          <header className="step-pane-head">
            <span className="eyebrow">{t("pane1Eyebrow")}</span>
            <h2 className="display step-pane-title">{t("pane1Title")}</h2>
          </header>
          {loadError && <p className="field-error">{t("submitError")}</p>}
          {!services && !loadError ? (
            <div className="time-empty">…</div>
          ) : (
            <div className="svc-mini">
              <div className="svc-mini-list">
                {services?.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    className={`svc-pill${state.serviceId === it.id ? " is-active" : ""}`}
                    aria-pressed={state.serviceId === it.id}
                    onClick={() => patch({ serviceId: it.id, date: null, slot: null })}
                  >
                    <span className="display svc-pill-name">{it.name}</span>
                    <span className="t-12 text-muted">~{it.duration_min} min</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="step-actions">
            <span />
            <button type="button" className="btn btn--accent btn--lg" disabled={!can[1]} onClick={() => goto(2)}>
              {t("continue")}
            </button>
          </div>
        </section>

        {/* STEP 2 — barber */}
        <section className="step-pane" hidden={state.step !== 2}>
          <header className="step-pane-head">
            <span className="eyebrow">{t("pane2Eyebrow")}</span>
            <h2 className="display step-pane-title">{t("pane2Title")}</h2>
          </header>
          <div className="barber-grid">
            <button
              type="button"
              className={`barber-card${state.barberId === "" ? " is-active" : ""}`}
              aria-pressed={state.barberId === ""}
              onClick={() => patch({ barberId: "", date: null, slot: null })}
            >
              <div className="barber-portrait barber-portrait--any">
                <span className="display">?</span>
              </div>
              <span className="display barber-name">{t("barberAny")}</span>
              <span className="t-14 text-muted">{t("barberAnyDesc")}</span>
            </button>
            {resourcesLoading && <div className="time-empty">…</div>}
            {resources?.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`barber-card${state.barberId === b.id ? " is-active" : ""}`}
                aria-pressed={state.barberId === b.id}
                onClick={() => patch({ barberId: b.id, date: null, slot: null })}
              >
                <div className="barber-portrait barber-portrait--any">
                  <span className="display">{b.name.charAt(0)}</span>
                </div>
                <span className="display barber-name">{b.name}</span>
              </button>
            ))}
          </div>
          <div className="step-actions">
            <button type="button" className="btn btn--ghost" onClick={() => goto(1)}>{t("back")}</button>
            <button type="button" className="btn btn--accent btn--lg" disabled={!can[2]} onClick={() => goto(3)}>
              {t("continue")}
            </button>
          </div>
        </section>

        {/* STEP 3 — date + time */}
        <section className="step-pane" hidden={state.step !== 3}>
          <header className="step-pane-head">
            <span className="eyebrow">{t("pane3Eyebrow")}</span>
            <h2 className="display step-pane-title">{t("pane3Title")}</h2>
          </header>
          <div className="datepicker">
            <div className="datepicker-head">
              <span className="t-12 eyebrow">{t("pickDay")}</span>
            </div>
            <div className="date-strip">
              {slotsLoading && <div className="time-empty">…</div>}
              {!slotsLoading && availableDates.length === 0 && (
                <div className="time-empty">{t("closedLabel")}</div>
              )}
              {!slotsLoading &&
                availableDates.map((iso) => {
                  const d = new Date(iso + "T00:00");
                  return (
                    <button
                      key={iso}
                      type="button"
                      className={`date-cell${state.date === iso ? " is-active" : ""}`}
                      onClick={() => patch({ date: iso, slot: null })}
                    >
                      <span className="date-cell-dow">{d.toLocaleDateString(dateLocale, { weekday: "short" })}</span>
                      <span className="date-cell-day">{d.getDate()}</span>
                      <span className="date-cell-mon">{d.toLocaleDateString(dateLocale, { month: "short" })}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="timepicker mt-32">
            <div className="datepicker-head">
              <span className="t-12 eyebrow">{t("pickTime")}</span>
            </div>
            <div className="time-grid">
              {!state.date ? (
                <div className="time-empty">{t("pickDayFirst")}</div>
              ) : daySlots.length === 0 ? (
                <div className="time-empty">{t("closedLabel")}</div>
              ) : (
                daySlots.map((iso) => (
                  <button
                    key={iso}
                    type="button"
                    className={`time-cell${state.slot === iso ? " is-active" : ""}`}
                    onClick={() => patch({ slot: iso })}
                  >
                    {shopTime(iso, dateLocale)}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="step-actions">
            <button type="button" className="btn btn--ghost" onClick={() => goto(2)}>{t("back")}</button>
            <button type="button" className="btn btn--accent btn--lg" disabled={!can[3]} onClick={() => goto(4)}>
              {t("continue")}
            </button>
          </div>
        </section>

        {/* STEP 4 — contact */}
        <section className="step-pane" hidden={state.step !== 4}>
          <header className="step-pane-head">
            <span className="eyebrow">{t("pane4Eyebrow")}</span>
            <h2 className="display step-pane-title">{t("pane4Title")}</h2>
          </header>
          <div className="form-grid">
            <div className="field">
              <label className="field-label" htmlFor="f-name">{t("nameLabel")}</label>
              <input
                className="input" type="text" id="f-name" autoComplete="name"
                value={state.name} data-invalid={errors.name ? "true" : undefined}
                onChange={(e) => patch({ name: e.target.value })}
              />
              <span className="field-error">{errors.name ?? ""}</span>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="f-phone">{t("phoneLabel")}</label>
              <input
                className="input" type="tel" id="f-phone" autoComplete="tel" placeholder={t("phonePlaceholder")}
                value={state.phone} data-invalid={errors.phone ? "true" : undefined}
                onChange={(e) => patch({ phone: e.target.value })}
              />
              <span className="field-error">{errors.phone ?? ""}</span>
            </div>
            <div className="field field-wide">
              <label className="field-label" htmlFor="f-email">{t("emailLabel")}</label>
              <input
                className="input" type="email" id="f-email" autoComplete="email" placeholder={t("emailPlaceholder")}
                value={state.email} onChange={(e) => patch({ email: e.target.value })}
              />
            </div>
            <div className="field field-wide">
              <label className="field-label" htmlFor="f-notes">{t("notesLabel")}</label>
              <textarea
                className="textarea" id="f-notes" rows={3} placeholder={t("notesPlaceholder")}
                value={state.notes} onChange={(e) => patch({ notes: e.target.value })}
              />
            </div>
          </div>
          <div className="step-actions">
            <button type="button" className="btn btn--ghost" onClick={() => goto(3)}>{t("back")}</button>
            <button
              type="button" className="btn btn--accent btn--lg" disabled={!can[4]}
              onClick={() => { if (validateContact()) goto(5); }}
            >
              {t("toConfirm")}
            </button>
          </div>
        </section>

        {/* STEP 5 — confirm */}
        <section className="step-pane" hidden={state.step !== 5}>
          <header className="step-pane-head">
            <span className="eyebrow">{t("pane5Eyebrow")}</span>
            <h2 className="display step-pane-title">{t("pane5Title")}</h2>
          </header>
          {confirmRows(false)}
          <p className="t-14 text-muted mt-16">{t("confirmNote")}</p>
          {submitError ? <p className="field-error mt-8">{t("submitError")}</p> : null}
          <div className="step-actions">
            <button type="button" className="btn btn--ghost" onClick={() => goto(4)}>{t("editBack")}</button>
            <button type="button" className="btn btn--accent btn--lg" disabled={submitting} onClick={submit}>
              {submitting ? t("submitting") : t("confirmBtn")}
            </button>
          </div>
        </section>

        {/* STEP 6 — success */}
        <section className="step-pane step-success" hidden={state.step !== 6}>
          <div className="success-mark" aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12.5l3 3 5-6" />
            </svg>
          </div>
          <h2 className="display step-pane-title mt-24">{t("successTitle")}</h2>
          <p className="lead mt-16">{t("successBody")}</p>
          <div className="mt-32">{confirmRows(true)}</div>
          {state.manageUrl ? (
            <p className="t-14 mt-16">
              <a href={state.manageUrl} target="_blank" rel="noopener"><strong>{t("confWhen")} ↗</strong></a>
            </p>
          ) : null}
          <div className="step-actions">
            <Link className="btn btn--ghost" href="/">{t("toHome")}</Link>
            <button
              type="button" className="btn btn--accent"
              onClick={() => { setState({ ...INITIAL }); setErrors({}); setSubmitError(false); }}
            >
              {t("another")}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
