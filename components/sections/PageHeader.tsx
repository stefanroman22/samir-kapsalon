import type { ReactNode } from "react";
import { RichText } from "@/lib/cms-rich-text";

export function PageHeader({
  eyebrow,
  children,
  intro,
}: {
  eyebrow: string;
  children: ReactNode;
  intro?: string;
}) {
  return (
    <section className="page-header">
      <div className="container">
        <span className="eyebrow eyebrow--accent"><RichText value={eyebrow} format="inline" /></span>
        <h1 className="display page-title">{children}</h1>
        {intro ? (
          <p className="lead mt-32">
            <RichText value={intro} format="inline" />
          </p>
        ) : null}
      </div>
    </section>
  );
}
