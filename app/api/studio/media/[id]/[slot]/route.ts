import { ARTWORK_SLOTS, ORDER_ID_PATTERN, type ArtworkSlot } from "@/lib/orderRecord";
import { OrderStoreError, readArtwork } from "@/lib/orderStore";
import { readStudioSession } from "@/lib/studioAuth";

type Context = { params: Promise<{ id: string; slot: string }> };

export async function GET(_request: Request, context: Context) {
  if (!(await readStudioSession())) return new Response("未登入。", { status: 401 });
  const { id, slot } = await context.params;
  if (!ORDER_ID_PATTERN.test(id) || !ARTWORK_SLOTS.includes(slot as ArtworkSlot)) {
    return new Response("找不到檔案。", { status: 404 });
  }
  try {
    const result = await readArtwork(id, slot as ArtworkSlot);
    if (!result) return new Response("找不到檔案。", { status: 404 });
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
    console.error("artwork read failed");
    return new Response("暫時未能讀取圖片。", { status: 500 });
  }
}
