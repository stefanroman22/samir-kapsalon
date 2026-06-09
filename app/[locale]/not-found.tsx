import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("nav");

  return (
    <main
      className="container"
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "16px",
        paddingTop: "160px",
        paddingBottom: "80px",
      }}
    >
      <span className="eyebrow eyebrow--accent">404</span>
      <h1 className="display" style={{ fontSize: "clamp(48px, 9vw, 120px)" }}>
        Pagina niet gevonden
      </h1>
      <Link href="/" className="btn btn--accent btn--lg mt-16">
        {t("home")}
      </Link>
    </main>
  );
}
