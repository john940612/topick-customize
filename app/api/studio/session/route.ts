import { readStudioSession, studioConfigured } from "@/lib/studioAuth";

export async function GET() {
  if (!studioConfigured()) return Response.json({ error: "工坊尚未設定密碼。" }, { status: 503 });
  if (!(await readStudioSession())) return Response.json({ error: "未登入。" }, { status: 401 });
  return Response.json({ ok: true });
}
