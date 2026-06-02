/** Allowed jersey sizes (normalized: no spaces, uppercase) */
export const ALLOWED_JERSEY_SIZES = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "5XL",
];

export function normalizeJerseySize(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

export function isValidJerseySize(value) {
  return ALLOWED_JERSEY_SIZES.includes(normalizeJerseySize(value));
}

export const JERSEY_SIZE_HINT =
  "S, M, L, XL, XXL, 3XL, 4XL, 5XL";
