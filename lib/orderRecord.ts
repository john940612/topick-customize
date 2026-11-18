import { isCapColor, type CapColor } from "@/lib/caps";
import type { NotePyramid, NotesSource } from "@/lib/types";

export const ORDER_ID_PATTERN = /^TP-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

export const ARTWORK_SLOTS = ["label", "photo", "name", "side"] as const;
export type ArtworkSlot = (typeof ARTWORK_SLOTS)[number];

export type OrderDraft = {
  productId: string;
  scentZh: string;
  scentEn: string;
  tagline: string;
  notes: NotePyramid;
  notesSource: NotesSource;
  concentration: number;
  concentrationZh: string;
  concentrationEn: string;
  labelName: string;
  boxName: string;
  sideTitle: string;
  boxStory: string;
  boxTop: string;
  boxMiddle: string;
  boxBase: string;
  photoAlt: string;
  capColor: CapColor;
  wechat: string;
  phone: string;
  shortName: string;
  /** How many bottles to make. At least 1. */
  quantity: number;
};

export type OrderRecord = OrderDraft & {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Lets the same browser session replace this order. Never send this to the shop UI. */
  editToken: string;
  images: Record<ArtworkSlot, boolean>;
};

export type OrderPublic = Omit<OrderRecord, "editToken">;

export type OrderSummary = Pick<
  OrderPublic,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "scentZh"
  | "scentEn"
  | "labelName"
  | "boxName"
  | "boxStory"
  | "boxTop"
  | "boxMiddle"
  | "boxBase"
  | "capColor"
  | "wechat"
  | "phone"
  | "shortName"
  | "quantity"
  | "images"
>;

export function toPublicOrder(record: OrderRecord): OrderPublic {
  const { editToken, ...publicRecord } = record;
  void editToken;
  return publicRecord;
}

export function studioMediaUrl(id: string, slot: ArtworkSlot) {
  return `/api/studio/media/${id}/${slot}`;
}

const DOWNLOAD_NAMES: Record<ArtworkSlot, string> = {
  label: "label.png",
  photo: "box-front.jpg",
  name: "box-name.png",
  side: "side.png",
};

export function artworkDownloadName(id: string, slot: ArtworkSlot) {
  return `${id}-${DOWNLOAD_NAMES[slot]}`;
}

export function studioDownloadUrl(id: string, slot: ArtworkSlot) {
  return `${studioMediaUrl(id, slot)}?download=1`;
}

export function formatMacauTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("zh-Hant-HK", {
    timeZone: "Asia/Macau",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function toSummary(record: OrderPublic): OrderSummary {
  return {
    id: record.id,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    scentZh: record.scentZh,
    scentEn: record.scentEn,
    labelName: record.labelName,
    boxName: record.boxName,
    boxStory: record.boxStory,
    boxTop: record.boxTop,
    boxMiddle: record.boxMiddle,
    boxBase: record.boxBase,
    capColor: record.capColor,
    wechat: record.wechat,
    phone: record.phone,
    shortName: record.shortName,
    quantity: record.quantity,
    images: record.images,
  };
}

const TEXT_LIMIT = 80;

function stringList(value: unknown, max: number) {
  if (!Array.isArray(value) || value.length > max) return null;
  const items: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || item.length > TEXT_LIMIT) return null;
    items.push(item);
  }
  return items;
}

export function parseOrderDraft(value: unknown): OrderDraft | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const notes = input.notes;
  if (!notes || typeof notes !== "object") return null;
  const noteRecord = notes as Record<string, unknown>;
  const top = stringList(noteRecord.top, 12);
  const middle = stringList(noteRecord.middle, 12);
  const base = stringList(noteRecord.base, 12);
  const topEn = noteRecord.topEn === undefined ? undefined : stringList(noteRecord.topEn, 12);
  const middleEn = noteRecord.middleEn === undefined ? undefined : stringList(noteRecord.middleEn, 12);
  const baseEn = noteRecord.baseEn === undefined ? undefined : stringList(noteRecord.baseEn, 12);
  if (!top || !middle || !base || topEn === null || middleEn === null || baseEn === null) return null;
  if (typeof input.productId !== "string" || input.productId.length > 40) return null;
  if (typeof input.scentZh !== "string" || input.scentZh.length > TEXT_LIMIT) return null;
  if (typeof input.scentEn !== "string" || input.scentEn.length > TEXT_LIMIT) return null;
  if (typeof input.tagline !== "string" || input.tagline.length > 200) return null;
  if (input.notesSource !== "official" && input.notesSource !== "placeholder") return null;
  if (typeof input.concentration !== "number" || input.concentration < 0 || input.concentration > 100) return null;
  if (typeof input.concentrationZh !== "string" || input.concentrationZh.length > 40) return null;
  if (typeof input.concentrationEn !== "string" || input.concentrationEn.length > 40) return null;
  if (typeof input.labelName !== "string" || input.labelName.length > 40) return null;
  if (typeof input.boxName !== "string" || input.boxName.length > 40) return null;
  if (typeof input.sideTitle !== "string" || input.sideTitle.length > 40) return null;
  const boxStory = optionalText(input.boxStory, 800);
  const boxTop = optionalText(input.boxTop, 240);
  const boxMiddle = optionalText(input.boxMiddle, 240);
  const boxBase = optionalText(input.boxBase, 240);
  if (boxStory === null || boxTop === null || boxMiddle === null || boxBase === null) return null;
  if (typeof input.photoAlt !== "string" || input.photoAlt.length > 120) return null;
  if (!isCapColor(input.capColor)) return null;
  const wechat = trimmedText(input.wechat, 60);
  const phone = normalizePhone(input.phone);
  const shortName = trimmedText(input.shortName, 40);
  const quantity = parseQuantity(input.quantity);
  if (!wechat || !phone || !shortName || quantity === null) return null;
  return {
    productId: input.productId,
    scentZh: input.scentZh,
    scentEn: input.scentEn,
    tagline: input.tagline,
    notes: { top, middle, base, topEn: topEn ?? undefined, middleEn: middleEn ?? undefined, baseEn: baseEn ?? undefined },
    notesSource: input.notesSource,
    concentration: input.concentration,
    concentrationZh: input.concentrationZh,
    concentrationEn: input.concentrationEn,
    labelName: input.labelName,
    boxName: input.boxName,
    sideTitle: input.sideTitle,
    boxStory,
    boxTop,
    boxMiddle,
    boxBase,
    photoAlt: input.photoAlt,
    capColor: input.capColor,
    wechat,
    phone,
    shortName,
    quantity,
  };
}

/** Whole bottles only. Blank, fractions, and anything under 1 are rejected. */
export function parseQuantity(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) return null;
  if (value < 1 || value > 9999) return null;
  return value;
}

/** Macao numbers: strip spaces, then keep exactly 8 digits. */
export function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\s/g, "");
  if (!/^\d{8}$/.test(digits)) return null;
  return digits;
}

function optionalText(value: unknown, max: number) {
  if (value === undefined) return "";
  if (typeof value !== "string" || value.length > max) return null;
  return value;
}

function trimmedText(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || text.length > max) return null;
  return text;
}
