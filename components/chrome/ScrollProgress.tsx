"use client";

import { useEffect, useRef } from "react";

// Fixed accent bar at the top of the viewport whose width tracks how far the
// visitor has scrolled (0 → 1). Drives a transform: scaleX() instead of a
// width animation so updates stay on the compositor (no layout work). Throttled
// to one update per animation frame.
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      el.style.transform = `scaleX(${Math.min(1, Math.max(0, pct))})`;
    };

    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}
