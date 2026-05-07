/**
 * Utility functions for image generation and processing.
 */

/**
 * Clamps a number within the inclusive lower and upper bounds.
 *
 * @param {number} value - The number to clamp.
 * @param {number} min - The lower bound.
 * @param {number} max - The upper bound.
 * @returns {number} The clamped number.
 */
export function clamp(value: number, min: number, max: number): number {
  const safeValue = isNaN(value) ? min : value;
  return Math.min(Math.max(safeValue, min), max);
}

/**
 * Parses raw dimension strings (e.g., "300x200" or "500") into width and height.
 * 
 * @param {string} raw - The raw dimension string.
 * @returns {{ w: number, h: number }} An object containing the width and height.
 */
export function parseDimensions(raw: string): { w: number; h: number } {
  const baseString = raw.split(".")[0];
  
  if (baseString.includes("x")) {
    const [widthStr, heightStr] = baseString.split("x");
    const width = Number(widthStr);
    const height = Number(heightStr);
    
    return { 
      w: clamp(width, 1, 5000), 
      h: clamp(height, 1, 5000) 
    };
  }
  
  const size = clamp(Number(baseString) || 300, 1, 5000);
  return { w: size, h: size };
}

/**
 * Automatically determines a high-contrast text color (black or white) 
 * based on the provided background hex color.
 *
 * @param {string} hex - The background hex color (with or without '#').
 * @returns {string} The contrast color ('#222222' or '#ffffff').
 */
export function getContrastColor(hex: string): string {
  const cleanHex = hex.replace(/^#/, "");
  
  // Expand shorthand hex (e.g., "fff" to "ffffff")
  const fullHex = cleanHex.length === 3 
    ? cleanHex.split("").map((char) => char + char).join("") 
    : cleanHex.slice(0, 6);
    
  const num = parseInt(fullHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  
  // Calculate relative luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  
  return luminance > 140 ? "#222222" : "#ffffff";
}

/**
 * Formats a raw serial string by removing non-numeric characters 
 * and padding it with leading zeros.
 *
 * @param {string} raw - The raw serial string.
 * @param {number} padLength - The desired length of the formatted serial.
 * @returns {string} The formatted and padded serial string.
 */
export function formatSerialNumber(raw: string, padLength: number): string {
  return raw.replace(/\D/g, "").padStart(padLength, "0");
}
