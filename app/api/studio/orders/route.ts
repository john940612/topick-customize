import { readStudioSession } from "@/lib/studioAuth";
import { listOrderSummaries, OrderStoreError } from "@/lib/orderStore";

export async function GET() {
  if (!(await readStudioSession())) return Response.json({ error: "未登入。" }, { status: 401 });
  try {
    const orders = await listOrderSummaries();
    return Response.json({ orders });
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("order list failed");
    return Response.json({ error: "暫時未能讀取訂單。" }, { status: 500 });
  }
}
