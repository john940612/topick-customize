import { NextResponse } from "next/server";
import { STUDIO_COOKIE, passwordsMatch, studioConfigured, studioCookieValue } from "@/lib/studioAuth";

export async function POST(request: Request) {
  if (!studioConfigured()) {
    return NextResponse.json({ error: "工坊尚未設定密碼。" }, { status: 503 });
  }
  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    password = "";
  }
  const expected = process.env.STUDIO_PASSWORD ?? "";
  if (!password || !passwordsMatch(password, expected)) {
    return NextResponse.json({ error: "密碼不正確。" }, { status: 401 });
  }
  const token = studioCookieValue();
  if (!token) return NextResponse.json({ error: "工坊尚未設定密碼。" }, { status: 503 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(STUDIO_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
