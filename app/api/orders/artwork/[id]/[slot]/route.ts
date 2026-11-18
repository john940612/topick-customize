import { ARTWORK_SLOTS, ORDER_ID_PATTERN, type ArtworkSlot } from "@/lib/orderRecord";
import { OrderStoreError, readCustomerArtwork } from "@/lib/orderStore";

type Context = { params: Promise<{ id: string; slot: string }> };

export async function GET(request: Request, context: Context) {
  const { id, slot } = await context.params;
  const token = request.headers.get("x-order-token") ?? "";
  if (!ORDER_ID_PATTERN.test(id) || !ARTWORK_SLOTS.includes(slot as ArtworkSlot) || !token) {
    return new Response("找不到訂單或電話不正確。", { status: 404 });
  }
  try {
    const result = await readCustomerArtwork(id, slot as ArtworkSlot, token);
    if (!result) return new Response("找不到訂單或電話不正確。", { status: 404 });
    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return new Response(error.message, { status: error.status });
    }
    console.error("customer artwork read failed");
    return new Response("暫時未能讀取圖片。", { status: 500 });
  }
}
