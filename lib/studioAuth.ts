import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const STUDIO_COOKIE = "topick_studio";

function passwordDigest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function passwordsMatch(input: string, expected: string) {
  return timingSafeEqual(passwordDigest(input), passwordDigest(expected));
}

function expectedSession() {
  const password = process.env.STUDIO_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("topick-studio-v1").digest("hex");
}

export function studioConfigured() {
  return Boolean(process.env.STUDIO_PASSWORD);
}

export async function readStudioSession() {
  const expected = expectedSession();
  if (!expected) return false;
  const current = (await cookies()).get(STUDIO_COOKIE)?.value;
  if (!current || current.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(current), Buffer.from(expected));
}

export function studioCookieValue() {
  return expectedSession();
}
