"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HOURS } from "@/lib/site";

// `variant="full"` → full day names + "09:00 — 18:00".
// `variant="short"` → abbreviations + "09 — 18" (footer).
// `variant="big"`   → full names + full times, large styling (contact page).
export function HoursTable({ variant = "full" }: { variant?: "full" | "short" | "big" }) {
  const t = useTranslations("hours");
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    // JS getDay(): 0 = Sunday … 6 = Saturday. Our array is Mon(0)…Sun(6).
    const js = new Date().getDay();
    setToday(js === 0 ? 6 : js - 1);
  }, []);

  const short = variant === "short";

  return (
    <table className={`hours${variant === "big" ? " hours--big" : ""}`} data-today-highlight>
      <tbody>
        {HOURS.map((row, i) => (
          <tr key={row.messageKey} className={today === i ? "is-today" : undefined}>
            <td>{t(short ? row.shortKey : row.messageKey)}</td>
            <td>{row.time === null ? t("closed") : short ? row.short : row.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
