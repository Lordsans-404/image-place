// app/medal/[name]/route.tsx
import { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

const EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg", "gif"];

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(isNaN(v) ? lo : v, lo), hi);
}

function formatSerial(raw: string, pad: number): string {
  return raw.replace(/\D/g, "").padStart(pad, "0");
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const sp = request.nextUrl.searchParams;
  const origin = new URL(request.url).origin;

  let imgSrc = "";
  for (const ext of EXTENSIONS) {
    try {
      const res = await fetch(`${origin}/assets/medal/${name}.${ext}`);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        imgSrc = `data:${res.headers.get("content-type") || "image/" + ext};base64,${btoa(binary)}`;
        break;
      }
    } catch {}
  }

  if (!imgSrc) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1a" }}>
        <span style={{ color: "#ff6b6b", fontSize: 20, fontWeight: 700 }}>Not found: {name}</span>
      </div>,
      { width: 500, height: 200, status: 404 }
    );
  }

  const w = clamp(Number(sp.get("w") || sp.get("width")) || 400, 10, 3000);
  const h = clamp(Number(sp.get("h") || sp.get("height")) || 400, 10, 3000);
  const rawText = (sp.get("text") || sp.get("t") || "").trim();
  const lines: string[] = rawText ? rawText.split("|").filter((l) => l.length > 0) : [];
  const color = "#" + (sp.get("color") || sp.get("c") || "ffd700").replace(/^#/, "");
  const fs = clamp(Number(sp.get("fontsize") || sp.get("fs")) || Math.min(w, h) * 0.09, 8, 300);
  const fontWeight: number = sp.get("bold") === "0" ? 400 : 700;
  const bg = sp.get("bg") ? "#" + sp.get("bg")!.replace(/^#/, "") : "transparent";
  const radius = clamp(Number(sp.get("radius") || sp.get("r")) || 0, 0, Math.min(w, h) / 2);

  const rawSerial = (sp.get("serial") || sp.get("s") || "").trim();
  const serialPad = clamp(Number(sp.get("pad")) || 4, 1, 10);
  const serialPrefix = sp.get("sprefix") || "#";
  const serialColor = "#" + (sp.get("serialcolor") || sp.get("sc") || "c8a96e").replace(/^#/, "");
  const serialSize = clamp(Number(sp.get("serialsize") || sp.get("ss")) || Math.min(w, h) * 0.065, 8, 200);
  const serialLabel = rawSerial !== "" ? serialPrefix + formatSerial(rawSerial, serialPad) : "";
  const hasSerial = serialLabel !== "";
  const hasText = lines.length > 0;

  // Manual vertical position (% from top of image, 0–100)
  // texty: where the text block starts
  // serialy: where the serial starts — defaults to just below text if not set
  const defaultTextY = 55;
  const defaultSerialY = defaultTextY + (fs / h) * 100 * lines.length + 2;

  const textY  = clamp(Number(sp.get("texty")   || defaultTextY),   0, 100);
  const serialY = clamp(Number(sp.get("serialy") || (
    hasText
      ? textY + (fs / h) * 100 * lines.length + 2
      : defaultSerialY
  )), 0, 100);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        borderRadius: radius,
        position: "relative",
      }}
    >
      {/* Medal fills full canvas */}
      <img
        src={imgSrc}
        width={w}
        height={h}
        style={{ position: "absolute", top: "0%", left: "0%", objectFit: "contain" }}
        alt=""
      />

      {/* Text — ?texty=55 to move up/down */}
      {hasText && (
        <div
          style={{
            position: "absolute",
            top: textY + "%",
            left: "0%",
            right: "0%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {lines.map((line, i) => (
            <span
              key={i}
              style={{
                color,
                fontSize: fs,
                fontWeight,
                lineHeight: 1.2,
                textShadow: "0 2px 6px rgba(0,0,0,0.6)",
              }}
            >
              {line}
            </span>
          ))}
        </div>
      )}

      {/* Serial — ?serialy=68 to move up/down */}
      {hasSerial && (
        <div
          style={{
            position: "absolute",
            top: serialY + "%",
            left: "0%",
            right: "0%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: serialColor,
              fontSize: serialSize,
              fontWeight: 400,
              fontFamily: "monospace",
              letterSpacing: Math.round(serialSize * 0.15),
              textShadow: "0 1px 3px rgba(0,0,0,0.7)",
            }}
          >
            {serialLabel}
          </span>
        </div>
      )}
    </div>,
    { width: w, height: h }
  );
}