/**
 * Public app config from Vite env (VITE_*).
 * Defaults match production so missing .env files still work.
 */

const trimEndSlash = (s) => String(s || "").replace(/\/+$/, "");
const withEndSlash = (s) => {
  const t = trimEndSlash(s);
  return t ? `${t}/` : "";
};

const rawApi = import.meta.env.VITE_API_BASE_URL || "https://api.crickbro.com";
const rawSite = import.meta.env.VITE_PUBLIC_SITE_URL || "https://crickbro.com";

/** Axios baseURL: empty in dev (Vite proxy), full URL in built apps */
export const clientApiBaseURL = import.meta.env.DEV ? "" : withEndSlash(rawApi);

/** Socket.IO server origin (no trailing slash) */
export const socketUrl = trimEndSlash(
  import.meta.env.VITE_SOCKET_URL || rawApi
);

/** Razorpay / share image logo */
export const logoUrl =
  import.meta.env.VITE_LOGO_URL ||
  `${trimEndSlash(rawSite)}/logo.png`;

export const contactEmail =
  import.meta.env.VITE_CONTACT_EMAIL || "info@crickbro.com";
