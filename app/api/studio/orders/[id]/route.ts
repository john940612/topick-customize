import { ORDER_ID_PATTERN } from "@/lib/orderRecord";
import { deleteOrder, OrderStoreError, readPublicOrder, setOrderArchived } from "@/lib/orderStore";
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

export async function PATCH(request: Request, context: Context) {
  if (!(await readStudioSession())) return Response.json({ error: "未登入。" }, { status: 401 });
  const { id } = await context.params;
  if (!ORDER_ID_PATTERN.test(id)) return Response.json({ error: "找不到訂單。" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "請求格式不正確。" }, { status: 400 });
  }
  const archived = (body as { archived?: unknown })?.archived;
  if (typeof archived !== "boolean") {
    return Response.json({ error: "請提供 archived: true 或 false。" }, { status: 400 });
  }
  try {
    const order = await setOrderArchived(id, archived);
    return Response.json({ order });
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("order archive failed");
    return Response.json({ error: "暫時未能更新訂單。" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await readStudioSession())) return Response.json({ error: "未登入。" }, { status: 401 });
  const { id } = await context.params;
  if (!ORDER_ID_PATTERN.test(id)) return Response.json({ error: "找不到訂單。" }, { status: 404 });
  try {
    await deleteOrder(id);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("order delete failed");
    return Response.json({ error: "暫時未能刪除訂單。" }, { status: 500 });
  }
}
