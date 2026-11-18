import { ORDER_ID_PATTERN } from "@/lib/orderRecord";
import { OrderStoreError, readPublicOrder } from "@/lib/orderStore";
import { readStudioSession } from "@/lib/studioAuth";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  if (!(await readStudioSession())) return Response.json({ error: "未登入。" }, { status: 401 });
  const { id } = await context.params;
  if (!ORDER_ID_PATTERN.test(id)) return Response.json({ error: "找不到訂單。" }, { status: 404 });
  try {
    const order = await readPublicOrder(id);
    if (!order) return Response.json({ error: "找不到訂單。" }, { status: 404 });
    return Response.json({ order });
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("order read failed");
    return Response.json({ error: "暫時未能讀取訂單。" }, { status: 500 });
  }
}
