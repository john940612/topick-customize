import { randomBytes, timingSafeEqual } from "node:crypto";
import {
  normalizePhone,
  ORDER_ID_PATTERN,
  type ArtworkSlot,
  type OrderDraft,
  type OrderPublic,
  type OrderRecord,
  type OrderSummary,
  toPublicOrder,
  toSummary,
} from "@/lib/orderRecord";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const FILES: Record<ArtworkSlot, { filename: string; type: string }> = {
  label: { filename: "label.png", type: "image/png" },
  photo: { filename: "photo.jpg", type: "image/jpeg" },
  name: { filename: "name.png", type: "image/png" },
  side: { filename: "side.png", type: "image/png" },
};

export class OrderStoreError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function requireBlob() {
  if (!blobConfigured()) {
    throw new OrderStoreError("儲存空間未設定。", 503);
  }
}

async function blobApi() {
  requireBlob();
  return import("@vercel/blob");
}

export function orderPrefix(id: string) {
  return `orders/${id}`;
}

export function artworkPath(id: string, slot: ArtworkSlot) {
  return `${orderPrefix(id)}/${FILES[slot].filename}`;
}

function manifestPath(id: string) {
  return `${orderPrefix(id)}/manifest.json`;
}

function createOrderId() {
  const bytes = randomBytes(6);
  let id = "TP-";
  for (const byte of bytes) id += ALPHABET[byte % ALPHABET.length];
  return id;
}

function tokensMatch(input: string, expected: string) {
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

function phonesMatch(input: string, expected: string) {
  return tokensMatch(input, expected);
}

const MISMATCH = "找不到訂單或電話不正確。";

async function readManifest(id: string): Promise<OrderRecord | null> {
  try {
    const { get } = await blobApi();
    const result = await get(manifestPath(id), { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return null;
    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text) as OrderRecord;
    if (!parsed || parsed.id !== id || typeof parsed.editToken !== "string") return null;
    parsed.capColor = parsed.capColor === "pink" || parsed.capColor === "purple" || parsed.capColor === "green" || parsed.capColor === "white" ? parsed.capColor : "white";
    parsed.labelStyle = parsed.labelStyle === "clear" ? "clear" : "classic";
    parsed.labelColor = parsed.labelColor === "blue" || parsed.labelColor === "gold" || parsed.labelColor === "green" || parsed.labelColor === "terracotta" ? parsed.labelColor : "terracotta";
    parsed.wechat = typeof parsed.wechat === "string" ? parsed.wechat : "";
    parsed.phone = typeof parsed.phone === "string" ? parsed.phone : "";
    parsed.shortName = typeof parsed.shortName === "string" ? parsed.shortName : "";
    parsed.boxStory = typeof parsed.boxStory === "string" ? parsed.boxStory : "";
    parsed.boxTop = typeof parsed.boxTop === "string" ? parsed.boxTop : "";
    parsed.boxMiddle = typeof parsed.boxMiddle === "string" ? parsed.boxMiddle : "";
    parsed.boxBase = typeof parsed.boxBase === "string" ? parsed.boxBase : "";
    parsed.quantity = typeof parsed.quantity === "number" && Number.isInteger(parsed.quantity) && parsed.quantity >= 1 && parsed.quantity <= 9999 ? parsed.quantity : 0;
    return parsed;
  } catch (error) {
    if (error instanceof OrderStoreError) throw error;
    return null;
  }
}

export async function resumeOrder(id: string, phone: string): Promise<OrderRecord> {
  const normalized = normalizePhone(phone);
  if (!normalized) throw new OrderStoreError("請填寫 8 位電話號碼。", 400);
  const orderId = id.trim().toUpperCase();
  const record = ORDER_ID_PATTERN.test(orderId) ? await readManifest(orderId) : null;
  const stored = record ? normalizePhone(record.phone) : null;
  const equal = phonesMatch(normalized, stored ?? "00000000");
  if (!record || !stored || !equal) throw new OrderStoreError(MISMATCH, 404);
  return record;
}

export async function readCustomerArtwork(id: string, slot: ArtworkSlot, token: string) {
  if (!ORDER_ID_PATTERN.test(id) || !(slot in FILES) || !token) return null;
  const record = await readManifest(id);
  if (!record || !tokensMatch(token, record.editToken) || !record.images[slot]) return null;
  return readArtwork(id, slot);
}

export async function readPublicOrder(id: string): Promise<OrderPublic | null> {
  if (!ORDER_ID_PATTERN.test(id)) return null;
  const record = await readManifest(id);
  return record ? toPublicOrder(record) : null;
}

export async function readArtwork(id: string, slot: ArtworkSlot) {
  if (!ORDER_ID_PATTERN.test(id) || !(slot in FILES)) return null;
  const { get } = await blobApi();
  const result = await get(artworkPath(id, slot), { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return result;
}

export async function listOrderSummaries(): Promise<OrderSummary[]> {
  const { list } = await blobApi();
  const manifests: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: "orders/", cursor, limit: 1000 });
    for (const blob of page.blobs) {
      if (blob.pathname.endsWith("/manifest.json")) manifests.push(blob.pathname);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && manifests.length < 300);

  const records = await Promise.all(
    manifests.map(async (pathname) => {
      const id = pathname.split("/")[1] ?? "";
      if (!ORDER_ID_PATTERN.test(id)) return null;
      return readManifest(id);
    }),
  );
  return records
    .filter((record): record is OrderRecord => Boolean(record))
    .map((record) => toSummary(toPublicOrder(record)))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

type SaveInput = {
  draft: OrderDraft;
  id?: string;
  token?: string;
  /** When the customer resumed with 訂單編號 + 電話, this phone must match the saved order. */
  authPhone?: string;
  files: Partial<Record<ArtworkSlot, Buffer>>;
};

export async function saveOrder({ draft, id, token, authPhone, files }: SaveInput) {
  const images: OrderRecord["images"] = {
    label: Boolean(files.label),
    photo: Boolean(files.photo),
    name: Boolean(files.name),
    side: Boolean(files.side),
  };
  if (draft.labelName.trim() && !images.label) throw new OrderStoreError("缺少標籤圖。", 400);
  if (draft.boxName.trim() && !images.name) throw new OrderStoreError("缺少盒上名稱圖。", 400);
  if (draft.sideTitle.trim() && !images.side) throw new OrderStoreError("缺少側板圖。", 400);
  if (!images.photo) throw new OrderStoreError("缺少盒面圖。", 400);

  let recordId = id ?? "";
  let createdAt = new Date().toISOString();
  let editToken = "";

  if (recordId) {
    if (!ORDER_ID_PATTERN.test(recordId) || !token) throw new OrderStoreError("未能更新這張訂單。", 403);
    const existing = await readManifest(recordId);
    if (!existing || !tokensMatch(token, existing.editToken)) {
      throw new OrderStoreError("未能更新這張訂單。", 403);
    }
    if (authPhone !== undefined) {
      const provided = normalizePhone(authPhone);
      const stored = normalizePhone(existing.phone);
      if (!provided || !stored || !phonesMatch(provided, stored)) {
        throw new OrderStoreError(MISMATCH, 403);
      }
    }
    createdAt = existing.createdAt;
    editToken = existing.editToken;
  } else {
    recordId = createOrderId();
    editToken = randomBytes(24).toString("hex");
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const existing = await readManifest(recordId);
      if (!existing) break;
      recordId = createOrderId();
    }
  }

  const { put } = await blobApi();
  const slots = (Object.keys(FILES) as ArtworkSlot[]).filter((slot) => files[slot]);
  await Promise.all(
    slots.map((slot) =>
      put(artworkPath(recordId, slot), files[slot] as Buffer, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: FILES[slot].type,
      }),
    ),
  );

  const record: OrderRecord = {
    ...draft,
    id: recordId,
    createdAt,
    updatedAt: new Date().toISOString(),
    editToken,
    images,
  };
  await put(manifestPath(recordId), JSON.stringify(record), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

  return { id: record.id, token: record.editToken };
}
