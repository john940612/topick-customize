import { normalizePhone } from "@/lib/orderRecord";
import { OrderStoreError, resumeOrder } from "@/lib/orderStore";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "找不到訂單或電話不正確。" }, { status: 404 });
    }
    const input = body && typeof body === "object" ? (body as { id?: unknown; phone?: unknown }) : {};
    if (!normalizePhone(input.phone)) {
      return Response.json({ error: "請填寫 8 位電話號碼。" }, { status: 400 });
    }
    const id = typeof input.id === "string" ? input.id : "";
    const record = await resumeOrder(id, String(input.phone));
    return Response.json({
      id: record.id,
      token: record.editToken,
      order: {
        productId: record.productId,
        concentration: record.concentration,
        labelName: record.labelName,
        boxName: record.boxName,
        sideTitle: record.sideTitle,
        photoAlt: record.photoAlt,
        capColor: record.capColor,
        wechat: record.wechat,
        phone: normalizePhone(record.phone) ?? record.phone,
        shortName: record.shortName,
        quantity: record.quantity,
      },
    });
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("order resume failed");
    return Response.json({ error: "暫時未能讀取，請稍後再試。" }, { status: 500 });
  }
}
