/**
 * Utility for fetching and converting image assets to base64 data URIs.
 * This is required for @vercel/og to embed images properly.
 */

const SUPPORTED_EXTENSIONS = ["svg", "png", "jpg", "jpeg", "webp", "gif"];

/**
 * Attempts to fetch an image asset from the local server and convert it to a Data URI.
 * It will try multiple extensions until it finds a matching file.
 *
 * @param {string} origin - The origin URL of the server (e.g., "http://localhost:3000").
 * @param {string} assetPath - The path directory for the assets (e.g., "/assets/").
 * @param {string} assetName - The base name of the asset without extension.
 * @returns {Promise<string>} A Promise that resolves to the base64 Data URI of the image, 
 *                            or an empty string if the asset cannot be found.
 */
export async function fetchAssetAsDataURI(
  origin: string, 
  assetPath: string, 
  assetName: string
): Promise<string> {
  for (const ext of SUPPORTED_EXTENSIONS) {
    try {
      const res = await fetch(`${origin}${assetPath}${assetName}.${ext}`);
      
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        let binaryString = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binaryString += String.fromCharCode(bytes[i]);
        }
        
        const contentType = res.headers.get("content-type") || `image/${ext}`;
        const base64Data = btoa(binaryString);
        
        return `data:${contentType};base64,${base64Data}`;
      }
    } catch (error) {
      // Silently ignore fetch errors for individual extensions and try the next one.
      // In a production app, we might want to log unexpected network failures.
    }
  }
  
  // Return an empty string if no asset was found after checking all extensions.
  return "";
}
