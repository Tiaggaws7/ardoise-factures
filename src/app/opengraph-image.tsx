import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Ardoise — Factures et devis pour freelances";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const font = readFileSync(path.join(process.cwd(), "assets/fonts/fraunces-latin-600-normal.woff"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#1d2833", color: "#fffdf8", fontFamily: "Fraunces" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#fffdf8", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 14 }}>
            <div style={{ width: 34, height: 6, borderRadius: 3, background: "#e4572e" }} />
          </div>
          <div style={{ fontSize: 44 }}>Ardoise</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1.05, letterSpacing: -2 }}>Des factures qui font pro,</div>
          <div style={{ fontSize: 84, lineHeight: 1.05, letterSpacing: -2, color: "#e4572e" }}>en deux minutes.</div>
        </div>
        <div style={{ fontSize: 28, opacity: 0.6, fontFamily: "Fraunces" }}>Devis · Factures · PDF élégants · Suivi des paiements</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Fraunces", data: font, weight: 600, style: "normal" }] },
  );
}
