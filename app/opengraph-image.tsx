import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Samir Kapsalon — Barbershop in Nijmegen";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "80px",
          background: "#1c1a17",
          color: "#f4f2ed",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 110, fontWeight: 800, letterSpacing: -3, textTransform: "uppercase" }}>
          SAMIR<span style={{ color: "#b56a3e" }}>.</span>KAPSALON
        </div>
        <div style={{ fontSize: 34, opacity: 0.75, marginTop: 18 }}>
          Klassiek vakmanschap — Groenestraat 277, Nijmegen
        </div>
        <div
          style={{
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginTop: 28,
            color: "#b56a3e",
          }}
        >
          4.8 · 105 Google reviews
        </div>
      </div>
    ),
    { ...size },
  );
}
