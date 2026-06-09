"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { BUSINESS, BOOKING_SERVICES, OPENING_HOURS, BARBER_PORTRAITS } from "@/lib/site";

const STORE = "samir.booking";

type State = {
  step: number;
  serviceId: string | null;
  barberId: string | null;
  date: string | null; // yyyy-mm-dd
  time: string | null; // HH:MM
  name: string;
  phone: string;
  email: string;
  notes: string;
  ref: string | null;
};

const INITIAL: State = {
  step: 1,
  serviceId: null,
  barberId: null,
  date: null,
  time: null,
  name: "",
  phone: "",
  email: "",
  notes: "",
  ref: null,
};

const fmtISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const dow = (d: Date) => (d.getDay() + 6) % 7; // Mon=0 … Sun=6

export function BookingForm() {
  const t = useTranslations("booking");
  const locale = useLocale();
  const dateLocale = t("dateLocale");
  const search = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<State>(INITIAL);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Load persisted state + apply ?barber prefill, after mount (avoids SSR mismatch).
  useEffect(() => {
    let next: State = { ...INITIAL };
    try {
      const raw = sessionStorage.getItem(STORE);
      if (raw) next = { ...INITIAL, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    const b = search.get("barber");
    if (!next.barberId && (b === "samir" || b === "mehmet")) next.barberId = b;
    setState(next);
    setMounted(true);
  }, [search]);

  // Persist.
  useEffect(() => {
    if (!mounted) return;
    try {
      sessionStorage.setItem(STORE, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, mounted]);

  // ---- Derived service catalogue (localized) ----
  const services = useMemo(() => {
    return BOOKING_SERVICES.map((g) => ({
      group: g.group,
      title: t(`group${g.group === "cuts" ? "Cuts" : g.group === "beard" ? "Beard" : "Combo"}`),
      items: g.items.map((it) => ({
        ...it,
        name: t(`serviceNames.${it.id}`),
        meta: t(`serviceMeta.${it.id}`),
        label: `${t(`serviceNames.${it.id}`)} — €${it.price}`,
      })),
    }));
  }, [t]);

  const allServices = useMemo(() => services.flatMap((g) => g.items), [services]);
  const service = allServices.find((s) => s.id === state.serviceId) ?? null;

  const barbers = [
    { id: "any", name: t("barberAny"), desc: t("barberAnyDesc"), portrait: null as string | null },
    { id: "samir", name: t("barberSamir"), desc: t("barberSamirDesc"), portrait: BARBER_PORTRAITS.samir },
    { id: "mehmet", name: t("barberMehmet"), desc: t("barberMehmetDesc"), portrait: BARBER_PORTRAITS.mehmet },
  ];
  const barber = barbers.find((b) => b.id === state.barberId) ?? null;

  // ---- Date strip (next 7 days) ----
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Time slots for the selected date ----
  const times = useMemo(() => {
    if (!state.date) return null;
    const d = new Date(state.date + "T00:00");
    const win = OPENING_HOURS[dow(d)];
    if (!win) return { closed: true as const, label: t("closedLabel"), slots: [] as { label: string; disabled: boolean }[] };
    const mins = service?.mins ?? 30;
    const [oh, om] = win.open.split(":").map(Number);
    const [ch, cm] = win.close.split(":").map(Number);
    const start = oh * 60 + om;
    const end = ch * 60 + cm - mins;
    // deterministic "already booked" slots so availability feels real
    const seed = [...state.date].reduce((a, c) => a + c.charCodeAt(0), 0);
    const taken = new Set<number>();
    const span = Math.max(1, Math.floor((end - start) / 30));
    for (let i = 0; i < 4; i++) taken.add(start + ((seed * (i + 1) * 13) % span) * 30);
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const isToday = state.date === fmtISO(now);
    const slots: { label: string; disabled: boolean }[] = [];
    for (let m = start; m <= end; m += 30) {
      const label = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
      slots.push({ label, disabled: taken.has(m) || (isToday && m < nowMins) });
    }
    return { closed: false as const, label: `${win.open} — ${win.close}`, slots };
  }, [state.date, service, t]);

  // ---- Helpers ----
  const patch = (p: Partial<State>) => setState((s) => ({ ...s, ...p }));
  const goto = (step: number) => {
    patch({ step });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fmtWhen = () => {
    if (!state.date || !state.time) return "—";
    const d = new Date(state.date + "T00:00");
    return `${d.toLocaleDateString(dateLocale, { weekday: "short", day: "numeric", month: "short" })} · ${state.time}`;
  };

  const phoneValid = /^[\d\s+\-()]{6,}$/.test(state.phone);
  const can: Record<number, boolean> = {
    1: !!state.serviceId,
    2: !!state.barberId,
    3: !!state.date && !!state.time,
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
    setSubmitting(true);
    setSubmitError(false);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: state.serviceId,
          barber: state.barberId,
          startAt: `${state.date}T${state.time}`,
          name: state.name,
          phone: state.phone,
          email: state.email,
          notes: state.notes,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("failed");
      patch({ ref: data.reference, step: 6 });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const stepDefs = [
    { n: 1, label: t("stepService"), pick: service ? service.label : "—" },
    { n: 2, label: t("stepBarber"), pick: barber ? barber.name : "—" },
    { n: 3, label: t("stepDatetime"), pick: fmtWhen() },
    { n: 4, label: t("stepDetails"), pick: state.name ? `${state.name}${state.phone ? " · " + state.phone : ""}` : "—" },
    { n: 5, label: t("stepConfirm"), pick: null },
  ];

  const confirmRows = (withRef: boolean) => (
    <dl className="confirm-list">
      <div><dt>{t("confService")}</dt><dd>{service?.label ?? "—"}</dd></div>
      <div><dt>{t("confBarber")}</dt><dd>{barber?.name ?? "—"}</dd></div>
      <div><dt>{t("confWhen")}</dt><dd>{fmtWhen()}</dd></div>
      {withRef ? (
        <div><dt>{t("refLabel")}</dt><dd>{state.ref ?? "—"}</dd></div>
      ) : (
        <>
          <div><dt>{t("confName")}</dt><dd>{state.name || "—"}</dd></div>
          <div><dt>{t("confPhone")}</dt><dd>{state.phone || "—"}</dd></div>
          <div><dt>{t("confEmail")}</dt><dd>{state.email || "—"}</dd></div>
          <div><dt>{t("confNotes")}</dt><dd>{state.notes || "—"}</dd></div>
          <div className="confirm-price"><dt>{t("confPrice")}</dt><dd>{service ? "€" + service.price : "—"}</dd></div>
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
          <div className="svc-groups">
            {services.map((g) => (
              <div className="svc-mini" key={g.group}>
                <h3 className="eyebrow svc-mini-title">{g.title}</h3>
                <div className="svc-mini-list">
                  {g.items.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      className={`svc-pill${state.serviceId === it.id ? " is-active" : ""}`}
                      aria-pressed={state.serviceId === it.id}
                      onClick={() => patch({ serviceId: it.id })}
                    >
                      <span className="display svc-pill-name">{it.name}</span>
                      <span className="t-12 text-muted">{it.meta}</span>
                      <span className="svc-pill-price">€{it.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
            {barbers.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`barber-card${state.barberId === b.id ? " is-active" : ""}`}
                aria-pressed={state.barberId === b.id}
                onClick={() => patch({ barberId: b.id })}
              >
                {b.portrait ? (
                  <div className="editorial barber-portrait" data-placeholder="true">
                    <Image src={b.portrait} alt={b.name} fill sizes="(max-width: 640px) 100vw, 33vw" style={{ objectFit: "cover" }} />
                  </div>
                ) : (
                  <div className="barber-portrait barber-portrait--any">
                    <span className="display">?</span>
                  </div>
                )}
                <span className="display barber-name">{b.name}</span>
                <span className="t-14 text-muted">{b.desc}</span>
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
              {mounted &&
                days.map((d) => {
                  const iso = fmtISO(d);
                  const closed = OPENING_HOURS[dow(d)] === null;
                  return (
                    <button
                      key={iso}
                      type="button"
                      className={`date-cell${state.date === iso ? " is-active" : ""}`}
                      disabled={closed}
                      onClick={() => patch({ date: iso, time: null })}
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
              <span className="t-12 text-muted">{times && !times.closed ? times.label : "—"}</span>
            </div>
            <div className="time-grid">
              {!times ? (
                <div className="time-empty">{t("pickDayFirst")}</div>
              ) : times.closed ? (
                <div className="time-empty">{t("closedLabel")}</div>
              ) : (
                times.slots.map((slot) => (
                  <button
                    key={slot.label}
                    type="button"
                    className={`time-cell${state.time === slot.label ? " is-active" : ""}`}
                    disabled={slot.disabled}
                    onClick={() => patch({ time: slot.label })}
                  >
                    {slot.label}
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
          <div className="step-actions">
            <Link className="btn btn--ghost" href="/">{t("toHome")}</Link>
            <button
              type="button" className="btn btn--accent"
              onClick={() => { setState(INITIAL); setErrors({}); setSubmitError(false); }}
            >
              {t("another")}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
