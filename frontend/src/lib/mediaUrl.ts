/**
 * Rewrites media URLs for playback. With `VITE_API_BASE_URL`, paths are
 * rooted on the API origin. In dev without that variable, path-only URLs
 * use the Vite proxy (same origin as the app).
 */
export function resolveMediaUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (base) {
    try {
      const { pathname, search } = new URL(url);
      return `${base}${pathname}${search}`;
    } catch {
      return url;
    }
  }
  if (import.meta.env.DEV) {
    try {
      const u = new URL(url);
      return `${u.pathname}${u.search}`;
    } catch {
      return url;
    }
  }
  return url;
}
