import { ORDER_ID_PATTERN } from "@/lib/orderRecord";

export const CUSTOMIZER_ORIGIN = "https://topick-customize.vercel.app";

/** Public return link. Only the order id is included. */
export function orderResumeUrl(orderId: string) {
  const id = orderId.trim().toUpperCase();
  if (!ORDER_ID_PATTERN.test(id)) return null;
  const url = new URL("/edit", CUSTOMIZER_ORIGIN);
  url.searchParams.set("order", id);
  return url.toString();
}

export function orderIdFromSearch(search: string) {
  const id = new URLSearchParams(search).get("order")?.trim().toUpperCase() ?? "";
  return ORDER_ID_PATTERN.test(id) ? id : null;
}
