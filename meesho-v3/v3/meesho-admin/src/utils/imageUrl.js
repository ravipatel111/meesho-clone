/**
 * Resolves a product/profile image to a usable absolute URL.
 *
 * The backend (Cloudinary + local uploads) can return images in any of these shapes:
 *   - A plain string URL:            "https://res.cloudinary.com/..."
 *   - A plain relative path:         "/uploads/products/abc.jpg"
 *   - An object with .url:           { url: "https://..." }
 *   - An object with .secure_url:    { secure_url: "https://..." }
 *   - An object with .path:          { path: "/uploads/..." }
 *
 * Returns null if nothing usable is found (so callers can show a placeholder).
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, "")
  : "https://meeshoapis.onrender.com";

export function resolveImageUrl(img) {
  if (!img) return null;

  let raw = "";

  if (typeof img === "string") {
    raw = img;
  } else if (typeof img === "object") {
    // Prefer secure_url (Cloudinary), then url, then path
    raw = img.secure_url || img.url || img.path || "";
  }

  if (!raw || typeof raw !== "string") return null;

  // Rewrite loremflickr.com URLs (which are unstable and return 500 errors) to picsum.photos
  if (raw.includes("loremflickr.com")) {
    try {
      const urlObj = new URL(raw);
      let lockVal = urlObj.searchParams.get("lock");
      if (!lockVal) {
        // Generate a deterministic hash from the URL string instead of using Math.random()
        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
          hash = (hash << 5) - hash + raw.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
        lockVal = Math.abs(hash).toString();
      }
      return `https://picsum.photos/seed/${lockVal}/600/600`;
    } catch {
      return "https://picsum.photos/600/600";
    }
  }

  // Already absolute
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  // Relative path — prepend backend base
  const clean = raw.startsWith("/") ? raw : `/${raw}`;
  return `${API_BASE}${clean}`;
}

/**
 * Gets the first usable image URL from a product's images array.
 * Falls back to null if none found.
 */
export function getFirstProductImage(images) {
  if (!Array.isArray(images) || images.length === 0) return null;
  for (const img of images) {
    const url = resolveImageUrl(img);
    if (url) return url;
  }
  return null;
}

/**
 * Returns a resolved URL or a gray SVG placeholder data URI.
 * Use when you always need an <img src> value.
 */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Cpath d='M80 70h40a5 5 0 015 5v40a5 5 0 01-5 5H80a5 5 0 01-5-5V75a5 5 0 015-5zm20 8a12 12 0 110 24 12 12 0 010-24zm-17 27l8-10 6 7 8-10 12 13H63z' fill='%23d1d5db'/%3E%3C/svg%3E";

export function resolveOrPlaceholder(img) {
  return resolveImageUrl(img) ?? PLACEHOLDER_IMAGE;
}

export function firstOrPlaceholder(images) {
  return getFirstProductImage(images) ?? PLACEHOLDER_IMAGE;
}
