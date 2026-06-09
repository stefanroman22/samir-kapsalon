import type { ReactNode } from "react";

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
        <span className="eyebrow eyebrow--accent">{eyebrow}</span>
        <h1 className="display page-title">{children}</h1>
        {intro ? <p className="lead mt-32">{intro}</p> : null}
      </div>
    </section>
  );
}
