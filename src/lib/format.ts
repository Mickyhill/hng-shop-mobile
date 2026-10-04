/** Formats kobo as Naira, e.g. 2850000 -> "₦28,500". Same output as the website. */
export function formatKobo(kobo: number): string {
  const naira = Math.round(kobo / 100).toString();
  return `₦${naira.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Shipping rule, mirrored from place_order() in the website's database. */
export const FREE_SHIPPING_THRESHOLD_KOBO = 5_000_000;
export const FLAT_SHIPPING_KOBO = 250_000;

export function shippingFor(subtotalKobo: number): number {
  return subtotalKobo >= FREE_SHIPPING_THRESHOLD_KOBO ? 0 : FLAT_SHIPPING_KOBO;
}

export const MAX_QTY = 20;
