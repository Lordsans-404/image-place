import { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";
import { 
  clamp, 
  parseDimensions, 
  getContrastColor, 
  formatSerialNumber 
} from "../../lib/utils";
import { fetchAssetAsDataURI } from "../../lib/image-fetcher";
import React from "react";

// Ensures this route runs on Vercel's Edge network for maximum performance.
export const runtime = "edge";

// Regex to identify if the requested name is a dimension string (e.g., "300x200" or "400.png")
const SIZE_PATTERN = /^\d+(x\d+)?(\.(png|svg|jpg|jpeg|webp))?$/i;

/**
 * Generates a simple placeholder image with customizable dimensions, background, and text.
 *
 * @param {URLSearchParams} searchParams - The query parameters from the request.
 * @param {string} rawName - The raw filename requested (e.g., "300x200").
 * @returns {ImageResponse} The generated SVG/Image response.
 */
function generatePlaceholder(searchParams: URLSearchParams, rawName: string): ImageResponse {
  const { w: width, h: height } = parseDimensions(rawName);
  
  const rawBg = searchParams.get("bg") || "e2e2e2";
  const backgroundColor = "#" + rawBg.replace(/^#/, "");
  
  const rawColor = searchParams.get("color") || searchParams.get("c");
  const textColor = rawColor ? "#" + rawColor.replace(/^#/, "") : getContrastColor(backgroundColor);
  
  const textContent = searchParams.get("text") || searchParams.get("t") || `${width}x${height}`;
  
  const minDimension = Math.min(width, height);
  const fontSizeParam = Number(searchParams.get("fontsize") || searchParams.get("fs"));
  const fontSize = clamp(fontSizeParam || minDimension * 0.14, 8, 120);
  
  const radiusParam = Number(searchParams.get("radius") || searchParams.get("r"));
  const borderRadius = clamp(radiusParam || 0, 0, minDimension / 2);

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
          borderRadius: borderRadius 
        }}
      >
        <span 
          style={{ 
            color: textColor, 
            fontSize: fontSize, 
            fontWeight: 500, 
            fontFamily: "sans-serif" 
          }}
        >
          {textContent}
        </span>
      </div>
    ),
    { width, height }
  );
}

/**
 * Generates an image overlay by placing text and serial numbers over a base image asset.
 *
 * @param {NextRequest} request - The incoming Next.js request object.
 * @param {URLSearchParams} searchParams - The query parameters.
 * @param {string} assetName - The name of the base asset to load.
 * @param {string} [subfolder=""] - Optional subfolder within the assets directory.
 * @returns {Promise<ImageResponse>} The generated overlay image response.
 */
async function generateAssetOverlay(
  request: NextRequest, 
  searchParams: URLSearchParams, 
  assetName: string, 
  subfolder: string = ""
): Promise<ImageResponse> {
  const origin = new URL(request.url).origin;
  const assetPath = subfolder ? `/assets/${subfolder}/` : `/assets/`;

  // Fetch the underlying asset to use as the base image
  const imageSourceURI = await fetchAssetAsDataURI(origin, assetPath, assetName);

  if (!imageSourceURI) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1a" }}>
          <span style={{ color: "#ff6b6b", fontSize: 20, fontWeight: 700 }}>
            Asset not found: {assetName}
          </span>
        </div>
      ),
      { width: 500, height: 200, status: 404 }
    );
  }

  // Dimension Configurations
  const width = clamp(Number(searchParams.get("w") || searchParams.get("width")) || 400, 10, 3000);
  const height = clamp(Number(searchParams.get("h") || searchParams.get("height")) || 400, 10, 3000);
  const minDimension = Math.min(width, height);
  
  // Text Configurations
  const rawText = (searchParams.get("text") || searchParams.get("t") || "").trim();
  const textLines: string[] = rawText ? rawText.split("|").filter((line) => line.length > 0) : [];
  const textColor = "#" + (searchParams.get("color") || searchParams.get("c") || "ffffff").replace(/^#/, "");
  const fontSize = clamp(Number(searchParams.get("fontsize") || searchParams.get("fs")) || minDimension * 0.1, 8, 300);
  const isBold = searchParams.get("bold") !== "0";
  const fontWeight: number = isBold ? 700 : 400;
  
  // Image Configurations
  const defaultImageRatio = subfolder === "medal" ? 0.9 : 0.55;
  const imageSize = clamp(Number(searchParams.get("imgsize") || searchParams.get("is")) || minDimension * defaultImageRatio, 20, minDimension);
  
  // Layout & Container Configurations
  const layoutStyle = (searchParams.get("layout") || "center").trim();
  const backgroundColor = searchParams.get("bg") ? "#" + searchParams.get("bg")!.replace(/^#/, "") : "transparent";
  const borderRadius = clamp(Number(searchParams.get("radius") || searchParams.get("r")) || 0, 0, minDimension / 2);
  const gapSize = minDimension * 0.05;

  // Serial Number Configurations
  const rawSerial = (searchParams.get("serial") || searchParams.get("s") || "").trim();
  const serialPad = clamp(Number(searchParams.get("pad")) || 4, 1, 10);
  const serialPrefix = searchParams.get("sprefix") || "#";
  const serialColor = "#" + (searchParams.get("serialcolor") || searchParams.get("sc") || "c8a96e").replace(/^#/, "");
  const serialSize = clamp(Number(searchParams.get("serialsize") || searchParams.get("ss")) || minDimension * 0.07, 8, 200);
  const serialPos = (searchParams.get("serialpos") || "bottom").trim();
  const serialLabel = rawSerial !== "" ? serialPrefix + formatSerialNumber(rawSerial, serialPad) : "";
  
  const hasSerial = serialLabel !== "";
  const hasText = textLines.length > 0;

  // Render Elements
  const renderSerialSpan = (
    <span 
      style={{ 
        color: serialColor, 
        fontSize: serialSize, 
        fontWeight: 400, 
        fontFamily: "monospace", 
        // CRITICAL: letterSpacing must be a px number, not "em" string, to avoid Satori crashes
        letterSpacing: Math.round(serialSize * 0.15) 
      }}
    >
      {serialLabel}
    </span>
  );

  const renderImage = (
    <img 
      src={imageSourceURI} 
      width={imageSize} 
      height={imageSize} 
      style={{ objectFit: "contain" }} 
      alt="Asset" 
    />
  );

  const renderTextBlock = hasText ? (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      {textLines.map((line, index) => (
        <span 
          key={index} 
          style={{ 
            color: textColor, 
            fontSize: fontSize, 
            fontWeight: fontWeight, 
            lineHeight: 1.2, 
            textShadow: "0 2px 8px rgba(0,0,0,0.55)" 
          }}
        >
          {line}
        </span>
      ))}
    </div>
  ) : null;

  const containerStyle = { 
    width: "100%", 
    height: "100%", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    background: backgroundColor, 
    borderRadius: borderRadius, 
    position: "relative" as const 
  };

  // Handle directional layouts (top, left, right)
  if (layoutStyle === "top" || layoutStyle === "left" || layoutStyle === "right") {
    const flexDirection = layoutStyle === "top" ? "column" : layoutStyle === "left" ? "row" : "row-reverse";
    return new ImageResponse(
      (
        <div style={{ ...containerStyle, flexDirection, gap: gapSize }}>
          {renderImage}
          {renderTextBlock}
          {hasSerial && (
            <div style={{ position: "absolute", bottom: "6%", left: "0%", right: "0%", display: "flex", justifyContent: "center" }}>
              {renderSerialSpan}
            </div>
          )}
        </div>
      ),
      { width, height }
    );
  }

  // Handle default center layout with absolute positioning for text and serials
  return new ImageResponse(
    (
      <div style={{ ...containerStyle, flexDirection: "column" }}>
        {renderImage}
        
        {hasText && (
          <div style={{ position: "absolute", bottom: "18%", left: "0%", right: "0%", display: "flex", justifyContent: "center" }}>
            {renderTextBlock}
          </div>
        )}
        
        {hasSerial && serialPos === "top" && (
          <div style={{ position: "absolute", top: "8%", left: "0%", right: "0%", display: "flex", justifyContent: "center" }}>
            {renderSerialSpan}
          </div>
        )}
        
        {hasSerial && serialPos === "center" && (
          <div style={{ position: "absolute", top: "0%", left: "0%", right: "0%", bottom: "0%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {renderSerialSpan}
          </div>
        )}
        
        {hasSerial && serialPos !== "top" && serialPos !== "center" && (
          <div style={{ position: "absolute", bottom: "7%", left: "0%", right: "0%", display: "flex", justifyContent: "center" }}>
            {renderSerialSpan}
          </div>
        )}
      </div>
    ),
    { width, height }
  );
}

/**
 * Main GET handler for dynamic image generation.
 * Routes traffic to either placeholder generation or asset overlay based on the requested name.
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ name: string }> }
) {
  const resolvedParams = await params;
  const assetName = resolvedParams.name;
  const searchParams = request.nextUrl.searchParams;
  
  if (SIZE_PATTERN.test(assetName)) {
    return generatePlaceholder(searchParams, assetName);
  }
  
  return generateAssetOverlay(request, searchParams, assetName);
}
