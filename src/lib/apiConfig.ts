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
 * Remote cloud hosting backend base URL
 */
export const REMOTE_HOSTING_URL = "https://technohub.kasunwalakumbura.com";

/**
 * Detect whether the current runtime environment is local development.
 * True for localhost, 127.0.0.1, or local machine.
 * False for Vercel (https://evon-registration.vercel.app) and production hosting.
 */
export function isLocalEnvironment(): boolean {
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    return (
      h === "localhost" ||
      h === "127.0.0.1" ||
      h === "::1" ||
      h.endsWith(".local")
    );
  }
  // Server-side
  return !process.env.VERCEL && process.env.NODE_ENV !== "production";
}

/**
 * Get the backend PHP/Apache base URL.
 * - On Vercel (https://evon-registration.vercel.app) & production: ALWAYS uses live hosting backend
 *   (https://technohub.kasunwalakumbura.com/backend)
 * - On local machine: uses local XAMPP Apache backend (http://localhost/Evon-registration/backend)
 */
export function getBackendBaseUrl(): string {
  // If running in browser:
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    // On Vercel or cloud hosting, always use remote hosting
    if (h.includes("vercel.app") || h.includes("kasunwalakumbura.com")) {
      return `${REMOTE_HOSTING_URL}/backend`;
    }
    // On local machine
    if (h === "localhost" || h === "127.0.0.1" || h === "::1") {
      return (
        process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL ||
        "http://localhost/Evon-registration/backend"
      );
    }
  }

  // Server-side (Vercel deployment check)
  if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV) {
    return `${REMOTE_HOSTING_URL}/backend`;
  }

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
 * - When running on Vercel (https://evon-registration.vercel.app):
 *   Prioritizes the live hosting backend at https://technohub.kasunwalakumbura.com directly.
 * - When running on local machine (localhost):
 *   Prioritizes local machine XAMPP Apache & Next.js bridge.
 */
export function getApiCandidateUrls(endpoint: string): string[] {
  const cleanEndpoint = endpoint.replace(/^\/+/, "");

  const isVercelOrRemote =
    (typeof window !== "undefined" &&
      (window.location.hostname.includes("vercel.app") ||
        window.location.hostname.includes("kasunwalakumbura.com"))) ||
    Boolean(process.env.VERCEL);

  if (isVercelOrRemote) {
    // Vercel deployment: Fetch directly from live hosting database
    return [
      `${REMOTE_HOSTING_URL}/backend/api/${cleanEndpoint}`,
      `/api/backend/${cleanEndpoint}`,
      `/backend/api/${cleanEndpoint}`,
      `${REMOTE_HOSTING_URL}/api/${cleanEndpoint}`,
      `${REMOTE_HOSTING_URL}/Evon-registration/backend/api/${cleanEndpoint}`,
    ];
  }

  // Local machine development: Fetch from local XAMPP backend
  const backendBase = getBackendBaseUrl();
  return [
    `/api/backend/${cleanEndpoint}`,
    `/backend/api/${cleanEndpoint}`,
    `${backendBase}/api/${cleanEndpoint}`,
    `http://localhost/Evon-registration/backend/api/${cleanEndpoint}`,
    `http://127.0.0.1/Evon-registration/backend/api/${cleanEndpoint}`,
    // Remote hosting fallback
    `${REMOTE_HOSTING_URL}/backend/api/${cleanEndpoint}`,
  ];
}
