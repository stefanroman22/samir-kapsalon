"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const KEY = "samir-cookie-choice";

export function CookieStrip() {
  const t = useTranslations("cookie");
  // null = undecided, false until mounted to avoid an SSR flash.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const choose = (choice: "accepted" | "declined") => {
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      /* storage unavailable — dismiss for this session only */
    }
    setVisible(false);
  };

  return (
    <div className="cookie-strip" data-hidden={visible ? "false" : "true"}>
      <span>{t("text")}</span>
      <div className="actions">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          style={{ borderColor: "oklch(96% 0.005 80 / 0.30)", color: "var(--primary-foreground)" }}
          onClick={() => choose("declined")}
        >
          {t("decline")}
        </button>
        <button type="button" className="btn btn--accent btn--sm" onClick={() => choose("accepted")}>
          {t("ok")}
        </button>
      </div>
    </div>
  );
}
