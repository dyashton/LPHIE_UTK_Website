import imageCompression from "browser-image-compression";

const PRESETS = {
  portrait: { maxSizeMB: 0.35, maxWidthOrHeight: 900, initialQuality: 0.82 },
  hero: { maxSizeMB: 0.75, maxWidthOrHeight: 1920, initialQuality: 0.85 },
};

const SKIP_BELOW_BYTES = 350 * 1024;

function isSvgUrl(url) {
  const path = String(url).split("?")[0].toLowerCase();
  return path.endsWith(".svg");
}

/**
 * Compress a bundled or remote image URL for display. Returns the original URL
 * for SVGs and images that are already small enough.
 * @param {string} url
 * @param {"portrait" | "hero"} preset
 * @returns {Promise<string>}
 */
export async function compressImageUrl(url, preset = "portrait") {
  if (!url || isSvgUrl(url)) return url;

  try {
    const response = await fetch(url);
    if (!response.ok) return url;

    const blob = await response.blob();
    if (!blob.type.startsWith("image/") || blob.type === "image/svg+xml") return url;
    if (blob.size <= SKIP_BELOW_BYTES) return url;

    const file = new File([blob], "image", { type: blob.type });
    const compressed = await imageCompression(file, {
      ...PRESETS[preset],
      useWebWorker: true,
    });

    return URL.createObjectURL(compressed);
  } catch (err) {
    console.warn("Image compression failed, using original:", url, err);
    return url;
  }
}

export function isBlobUrl(url) {
  return typeof url === "string" && url.startsWith("blob:");
}

export function revokeBlobUrl(url) {
  if (isBlobUrl(url)) URL.revokeObjectURL(url);
}
