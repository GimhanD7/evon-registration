/**
 * Centralized API & Base URL Configuration
 * Evon Higher Education LMS
 *
 * Configures frontend and backend base URLs with environment variable overrides
 * and universal fallback detection for development, XAMPP, and production.
 */

/**
 * Get the frontend web application base URL.
 * - In browser: uses window.location.origin (automatically matching port/host)
 * - On server: uses NEXT_PUBLIC_SITE_URL or falls back to http://localhost:3000
 */
export function getSiteBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

/**
 * Get the backend PHP/Apache base URL.
 * Defaults to the standard XAMPP deployment path: http://localhost/Evon-registration/backend
 */
export function getBackendBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_APACHE_URL ||
    "http://localhost/Evon-registration/backend";

  return configured.replace(/\/+$/, "");
}

/**
 * Get the full direct URL to a backend API or script file.
 * e.g., getDirectBackendUrl("api/seed.php") => "http://localhost/Evon-registration/backend/api/seed.php"
 */
export function getDirectBackendUrl(subpath: string): string {
  const cleanSubpath = subpath.replace(/^\/+/, "");
  const base = getBackendBaseUrl();
  return `${base}/${cleanSubpath}`;
}

/**
 * Generates an ordered list of candidate URLs to reach a backend API endpoint.
 * Ensures compatibility across:
 * 1. Next.js internal API bridge (/api/backend/...)
 * 2. Next.js proxied rewrites (/backend/api/...)
 * 3. Direct configured backend base URL (NEXT_PUBLIC_BACKEND_URL)
 * 4. Standard XAMPP localhost and 127.0.0.1 addresses
 */
export function getApiCandidateUrls(endpoint: string): string[] {
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  const backendBase = getBackendBaseUrl();

  const candidates = [
    // 1. Next.js native API bridge (works universally without CORS on any host/port)
    `/api/backend/${cleanEndpoint}`,

    // 2. Proxied path via Next.js rewrites
    `/backend/api/${cleanEndpoint}`,

    // 3. Configured backend base URL
    `${backendBase}/api/${cleanEndpoint}`,

    // 4. Default XAMPP localhost
    `http://localhost/Evon-registration/backend/api/${cleanEndpoint}`,

    // 5. Default XAMPP 127.0.0.1
    `http://127.0.0.1/Evon-registration/backend/api/${cleanEndpoint}`,
  ];

  // Return deduplicated list
  return Array.from(new Set(candidates));
}
