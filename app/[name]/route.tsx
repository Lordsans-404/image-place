import { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

const SIZE_RE = /^\d+(x\d+)?(\.(png|svg|jpg|jpeg|webp))?$/i;
const EXTENSIONS = ["svg", "png", "jpg", "jpeg", "webp", "gif"];

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(isNaN(v) ? lo : v, lo), hi);
}

function parseDims(raw: string): { w: number; h: number } {
  const s = raw.split(".")[0];
  if (s.includes("x")) {
    const [a, b] = s.split("x").map(Number);
    return { w: clamp(a, 1, 5000), h: clamp(b, 1, 5000) };
  }
  const n = clamp(Number(s) || 300, 1, 5000);
  return { w: n, h: n };
}

function autoColor(hex: string): string {
  const c = hex.replace(/^#/, "");
  const n = parseInt(
    c.length === 3 ? c.split("").map((x) => x + x).join("") : c.slice(0, 6), 16
  );
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140 ? "#222222" : "#ffffff";
}

function formatSerial(raw: string, pad: number): string {
  return raw.replace(/\D/g, "").padStart(pad, "0");
}

function makePlaceholder(sp: URLSearchParams, raw: string) {
  const { w, h } = parseDims(raw);
  const bg = "#" + (sp.get("bg") || "e2e2e2").replace(/^#/, "");
  const rawC = sp.get("color") || sp.get("c");
  const color = rawC ? "#" + rawC.replace(/^#/, "") : autoColor(bg);
  const text = sp.get("text") || sp.get("t") || `${w}x${h}`;
  const fs = clamp(Number(sp.get("fontsize") || sp.get("fs")) || Math.min(w, h) * 0.14, 8, 120);
  const radius = clamp(Number(sp.get("radius") || sp.get("r")) || 0, 0, Math.min(w, h) / 2);
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: bg, borderRadius: radius }}>
      <span style={{ color, fontSize: fs, fontWeight: 500, fontFamily: "sans-serif" }}>{text}</span>
    </div>,
    { width: w, height: h }
  );
}

async function makeOverlay(request: NextRequest, sp: URLSearchParams, name: string, subfolder = "") {
  const origin = new URL(request.url).origin;
  const assetBase = subfolder ? `/assets/${subfolder}/` : `/assets/`;

  let imgSrc = "";
  for (const ext of EXTENSIONS) {
    try {
      const res = await fetch(`${origin}${assetBase}${name}.${ext}`);
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
  const color = "#" + (sp.get("color") || sp.get("c") || "ffffff").replace(/^#/, "");
  const fs = clamp(Number(sp.get("fontsize") || sp.get("fs")) || Math.min(w, h) * 0.1, 8, 300);
  const fontWeight: number = sp.get("bold") === "0" ? 400 : 700;
  const defaultImgPct = subfolder === "medal" ? 0.9 : 0.55;
  const imgSize = clamp(Number(sp.get("imgsize") || sp.get("is")) || Math.min(w, h) * defaultImgPct, 20, Math.min(w, h));
  const layout = (sp.get("layout") || "center").trim();
  const bg = sp.get("bg") ? "#" + sp.get("bg")!.replace(/^#/, "") : "transparent";
  const radius = clamp(Number(sp.get("radius") || sp.get("r")) || 0, 0, Math.min(w, h) / 2);
  const gap = Math.min(w, h) * 0.05;

  const rawSerial = (sp.get("serial") || sp.get("s") || "").trim();
  const serialPad = clamp(Number(sp.get("pad")) || 4, 1, 10);
  const serialPrefix = sp.get("sprefix") || "#";
  const serialColor = "#" + (sp.get("serialcolor") || sp.get("sc") || "c8a96e").replace(/^#/, "");
  const serialSize = clamp(Number(sp.get("serialsize") || sp.get("ss")) || Math.min(w, h) * 0.07, 8, 200);
  const serialPos = (sp.get("serialpos") || "bottom").trim();
  const serialLabel = rawSerial !== "" ? serialPrefix + formatSerial(rawSerial, serialPad) : "";
  const hasSerial = serialLabel !== "";
  const hasText = lines.length > 0;

  // CRITICAL: letterSpacing must be a px number, not "em" string — Satori crashes on em units
  const serialSpan = (
    <span style={{ color: serialColor, fontSize: serialSize, fontWeight: 400, fontFamily: "monospace", letterSpacing: Math.round(serialSize * 0.15) }}>
      {serialLabel}
    </span>
  );

  const imgEl = <img src={imgSrc} width={imgSize} height={imgSize} style={{ objectFit: "contain" }} alt="" />;

  const textBlock = hasText ? (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      {lines.map((line, i) => (
        <span key={i} style={{ color, fontSize: fs, fontWeight, lineHeight: 1.2, textShadow: "0 2px 8px rgba(0,0,0,0.55)" }}>
          {line}
        </span>
      ))}
    </div>
  ) : null;

  const wrap = { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: bg, borderRadius: radius, position: "relative" as const };

  if (layout === "top" || layout === "left" || layout === "right") {
    const dir = layout === "top" ? "column" : layout === "left" ? "row" : "row-reverse";
    return new ImageResponse(
      <div style={{ ...wrap, flexDirection: dir, gap }}>
        {imgEl}
        {textBlock}
        {hasSerial && (
          <div style={{ position: "absolute", bottom: "6%", left: "0%", right: "0%", display: "flex", justifyContent: "center" }}>
            {serialSpan}
          </div>
        )}
      </div>,
      { width: w, height: h }
    );
  }

  // center layout — three separate serial divs, no undefined style values, no transform
  return new ImageResponse(
    <div style={{ ...wrap, flexDirection: "column" }}>
      {imgEl}
      {hasText && (
        <div style={{ position: "absolute", bottom: "18%", left: "0%", right: "0%", display: "flex", justifyContent: "center" }}>
          {textBlock}
        </div>
      )}
      {hasSerial && serialPos === "top" && (
        <div style={{ position: "absolute", top: "8%", left: "0%", right: "0%", display: "flex", justifyContent: "center" }}>
          {serialSpan}
        </div>
      )}
      {hasSerial && serialPos === "center" && (
        <div style={{ position: "absolute", top: "0%", left: "0%", right: "0%", bottom: "0%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {serialSpan}
        </div>
      )}
      {hasSerial && serialPos !== "top" && serialPos !== "center" && (
        <div style={{ position: "absolute", bottom: "7%", left: "0%", right: "0%", display: "flex", justifyContent: "center" }}>
          {serialSpan}
        </div>
      )}
    </div>,
    { width: w, height: h }
  );
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const sp = request.nextUrl.searchParams;
  if (SIZE_RE.test(name)) return makePlaceholder(sp, name);
  return makeOverlay(request, sp, name);
}