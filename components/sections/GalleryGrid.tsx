"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type GalleryImage = { src: string; span: number };

export function GalleryGrid({
  images,
  labels,
}: {
  images: readonly GalleryImage[];
  labels: { close: string; prev: string; next: string; dialog: string; alt: string };
}) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const total = images.length;

  const show = useCallback((i: number) => {
    setIdx((i + total) % total);
    setOpen(true);
  }, [total]);

  const close = useCallback(() => setOpen(false), []);
  const next = useCallback(() => setIdx((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIdx((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, prev, next]);

  return (
    <>
      <div className="masonry">
        {images.map((img, i) => (
          <button
            key={img.src + i}
            type="button"
            className="masonry-item reveal"
            data-placeholder="true"
            style={{ gridRow: `span ${img.span}` }}
            aria-label={`${labels.alt} ${i + 1}`}
            onClick={() => show(i)}
          >
            <Image
              src={img.src}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              style={{ objectFit: "cover" }}
            />
          </button>
        ))}
      </div>

      <div className="lightbox" data-open={open ? "true" : "false"} role="dialog" aria-modal="true" aria-label={labels.dialog}>
        <button className="lightbox-close" aria-label={labels.close} onClick={close}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
        <button className="lightbox-prev" aria-label={labels.prev} onClick={prev}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <button className="lightbox-next" aria-label={labels.next} onClick={next}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
        <div className="lightbox-stage" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          {open ? (
            <Image src={images[idx].src} alt="" fill sizes="100vw" style={{ objectFit: "contain" }} />
          ) : null}
        </div>
        <div className="lightbox-count">
          {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
      </div>
    </>
  );
}
