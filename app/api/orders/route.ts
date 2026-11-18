import { getCatalog } from "@/lib/catalog";
import { ARTWORK_SLOTS, type ArtworkSlot, parseOrderDraft } from "@/lib/orderRecord";
import { OrderStoreError, saveOrder } from "@/lib/orderStore";

export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;

async function readImage(form: FormData, slot: ArtworkSlot) {
  const value = form.get(slot);
  if (value === null || value === "") return null;
  if (!(value instanceof File)) return null;
  if (value.size > MAX_BYTES) throw new OrderStoreError("圖片請小於 10MB。", 413);
  if (!value.type.startsWith("image/")) throw new OrderStoreError("圖片格式不支援。", 400);
  return Buffer.from(await value.arrayBuffer());
}

export async function POST(request: Request) {
  try {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return Response.json({ error: "資料不完整。" }, { status: 400 });
    }
    const draft = parseOrderDraft(JSON.parse(String(form.get("meta") ?? "")));
    if (!draft) return Response.json({ error: "資料不完整。" }, { status: 400 });
    const product = getCatalog().products.find((item) => item.id === draft.productId);
    if (!product || product.nameZh !== draft.scentZh || product.nameEn !== draft.scentEn) {
      return Response.json({ error: "找不到這支香。" }, { status: 400 });
    }

    const files: Partial<Record<ArtworkSlot, Buffer>> = {};
    for (const slot of ARTWORK_SLOTS) {
      const file = await readImage(form, slot);
      if (file) files[slot] = file;
    }

    const id = String(form.get("id") ?? "");
    const token = String(form.get("token") ?? "");
    const saved = await saveOrder({
      draft,
      id: id || undefined,
      token: token || undefined,
      files,
    });
    return Response.json({ id: saved.id, token: saved.token });
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: "資料不完整。" }, { status: 400 });
    }
    console.error("order save failed");
    return Response.json({ error: "暫時未能儲存，請稍後再試。" }, { status: 500 });
  }
}
