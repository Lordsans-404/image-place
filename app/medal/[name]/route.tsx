import { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";
import { clamp, formatSerialNumber } from "../../../lib/utils";
import { fetchAssetAsDataURI } from "../../../lib/image-fetcher";
import React from "react";

// Ensures this route runs on Vercel's Edge network for optimal latency.
export const runtime = "edge";

/**
 * Handles GET requests to generate custom medal images (Gold, Silver, Bronze, etc.).
 * It overlays text and serial numbers onto specialized medal assets.
 *
 * @param {NextRequest} request - The incoming Next.js request.
 * @param {{ params: Promise<{ name: string }> }} context - Route parameters containing the medal name.
 * @returns {Promise<ImageResponse>} The generated medal image.
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ name: string }> }
) {
  const resolvedParams = await params;
  const medalName = resolvedParams.name;
  const searchParams = request.nextUrl.searchParams;
  const origin = new URL(request.url).origin;

  // Fetch the medal image asset from the server
  const imageSourceURI = await fetchAssetAsDataURI(origin, "/assets/medal/", medalName);

  // Return a 404 image if the requested medal asset does not exist
  if (!imageSourceURI) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1a" }}>
          <span style={{ color: "#ff6b6b", fontSize: 20, fontWeight: 700 }}>
            Medal not found: {medalName}
          </span>
        </div>
      ),
      { width: 500, height: 200, status: 404 }
    );
  }

  // Dimension Setup
  const width = clamp(Number(searchParams.get("w") || searchParams.get("width")) || 400, 10, 3000);
  const height = clamp(Number(searchParams.get("h") || searchParams.get("height")) || 400, 10, 3000);
  const minDimension = Math.min(width, height);

  // Text Configurations
  const rawText = (searchParams.get("text") || searchParams.get("t") || "").trim();
  const textLines: string[] = rawText ? rawText.split("|").filter((line) => line.length > 0) : [];
  const textColor = "#" + (searchParams.get("color") || searchParams.get("c") || "ffd700").replace(/^#/, "");
  const fontSize = clamp(Number(searchParams.get("fontsize") || searchParams.get("fs")) || minDimension * 0.09, 8, 300);
  const isBold = searchParams.get("bold") !== "0";
  const fontWeight: number = isBold ? 700 : 400;
  
  // Background & Container Setup
  const backgroundColor = searchParams.get("bg") ? "#" + searchParams.get("bg")!.replace(/^#/, "") : "transparent";
  const borderRadius = clamp(Number(searchParams.get("radius") || searchParams.get("r")) || 0, 0, minDimension / 2);

  // Serial Number Configurations
  const rawSerial = (searchParams.get("serial") || searchParams.get("s") || "").trim();
  const serialPad = clamp(Number(searchParams.get("pad")) || 4, 1, 10);
  const serialPrefix = searchParams.get("sprefix") || "#";
  const serialColor = "#" + (searchParams.get("serialcolor") || searchParams.get("sc") || "c8a96e").replace(/^#/, "");
  const serialSize = clamp(Number(searchParams.get("serialsize") || searchParams.get("ss")) || minDimension * 0.065, 8, 200);
  const serialLabel = rawSerial !== "" ? serialPrefix + formatSerialNumber(rawSerial, serialPad) : "";
  
  const hasSerial = serialLabel !== "";
  const hasText = textLines.length > 0;

  // Vertical Positioning Logic (% from top of the image)
  const defaultTextY = 55;
  const defaultSerialY = defaultTextY + (fontSize / height) * 100 * textLines.length + 2;

  const textY = clamp(Number(searchParams.get("texty") || defaultTextY), 0, 100);
  
  // Calculate default serial Y position dynamically based on text height if not explicitly provided
  const calculatedSerialY = hasText 
    ? textY + (fontSize / height) * 100 * textLines.length + 2 
    : defaultSerialY;
    
  const serialY = clamp(Number(searchParams.get("serialy") || calculatedSerialY), 0, 100);

  // Reusable JSX Elements
  const renderMedalBackground = (
    <img
      src={imageSourceURI}
      width={width}
      height={height}
      style={{ position: "absolute", top: "0%", left: "0%", objectFit: "contain" }}
      alt="Medal Background"
    />
  );

  const renderTextOverlay = hasText ? (
    <div
      style={{
        position: "absolute",
        top: `${textY}%`,
        left: "0%",
        right: "0%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      {textLines.map((line, index) => (
        <span
          key={index}
          style={{
            color: textColor,
            fontSize: fontSize,
            fontWeight: fontWeight,
            lineHeight: 1.2,
            textShadow: "0 2px 6px rgba(0,0,0,0.6)", // Enhances visibility over shiny medals
          }}
        >
          {line}
        </span>
      ))}
    </div>
  ) : null;

  const renderSerialOverlay = hasSerial ? (
    <div
      style={{
        position: "absolute",
        top: `${serialY}%`,
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
          textShadow: "0 1px 3px rgba(0,0,0,0.7)", // Deep shadow for etched look
        }}
      >
        {serialLabel}
      </span>
    </div>
  ) : null;

  // Final Assembly
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: backgroundColor,
          borderRadius: borderRadius,
          position: "relative",
        }}
      >
        {renderMedalBackground}
        {renderTextOverlay}
        {renderSerialOverlay}
      </div>
    ),
    { width, height }
  );
}
