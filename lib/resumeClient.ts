import { isCapColor } from "@/lib/caps";
import { boxCopyFromProduct } from "@/lib/boxCopy";
import { getCatalog } from "@/lib/catalog";
import { printedName } from "@/lib/lettering";
import { normalizePhone } from "@/lib/orderRecord";
import { loadImage } from "@/lib/packArt";
import type { DesignState, PhotoFrame } from "@/lib/types";

export const ORDER_SESSION_KEY = "topick-order-v1";

export type OrderContact = {
  wechat: string;
  phone: string;
  shortName: string;
  quantity: string;
};

export type LoadedOrder = {
  id: string;
  token: string;
  authPhone: string;
  design: DesignState;
  contact: OrderContact;
};

type ResumeOrder = {
  productId: string;
  concentration: number;
  labelName: string;
  boxName: string;
  sideTitle: string;
  boxStory?: string;
  boxTop?: string;
  boxMiddle?: string;
  boxBase?: string;
  photoAlt: string;
  capColor: string;
  wechat: string;
  phone: string;
  shortName: string;
  quantity: number;
};

export async function loadSavedOrder(orderId: string, phoneRaw: string, productIds: readonly string[]): Promise<LoadedOrder> {
  const phone = normalizePhone(phoneRaw);
  if (!phone) throw new Error("請填寫 8 位電話號碼。");
  const response = await fetch("/api/orders/resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: orderId.trim(), phone: phoneRaw }),
  });
  const body = (await response.json()) as { id?: string; token?: string; order?: ResumeOrder; error?: string };
  if (!response.ok || !body.id || !body.token || !body.order) {
    throw new Error(body.error || "找不到訂單或電話不正確。");
  }
  if (!productIds.includes(body.order.productId)) throw new Error("暫時未能讀取訂單。");
  const photo = await savedPhoto(body.id, body.token, body.order.photoAlt);
  const savedPhone = normalizePhone(body.order.phone) ?? phone;
  return {
    id: body.id,
    token: body.token,
    authPhone: savedPhone,
    design: {
      productId: body.order.productId,
      concentration: body.order.concentration,
      labelName: printedName(body.order.labelName),
      boxName: printedName(body.order.boxName),
      linkNames: printedName(body.order.labelName) === printedName(body.order.boxName),
      sideTitle: body.order.sideTitle,
      ...savedBoxCopy(body.order),
      capColor: isCapColor(body.order.capColor) ? body.order.capColor : "white",
      photo,
    },
    contact: {
      wechat: body.order.wechat,
      phone: savedPhone,
      shortName: body.order.shortName,
      quantity: String(body.order.quantity),
    },
  };
}

function savedBoxCopy(order: ResumeOrder) {
  const product = getCatalog().products.find((item) => item.id === order.productId);
  const fixed = product ? boxCopyFromProduct(product) : { boxStory: "", boxTop: "", boxMiddle: "", boxBase: "" };
  return {
    boxStory: order.boxStory?.trim() ? order.boxStory : fixed.boxStory,
    boxTop: fixed.boxTop,
    boxMiddle: fixed.boxMiddle,
    boxBase: fixed.boxBase,
  };
}

async function savedPhoto(id: string, token: string, alt: string): Promise<PhotoFrame> {
  const response = await fetch(`/api/orders/artwork/${id}/photo`, {
    headers: { "x-order-token": token },
  });
  if (!response.ok) throw new Error("暫時未能讀取訂單。");
  const blob = await response.blob();
  const src = URL.createObjectURL(blob);
  try {
    const image = await loadImage(src);
    return {
      src,
      alt: alt || "盒面主圖",
      source: "upload",
      snap: true,
      zoom: 1,
      focusX: 0.5,
      focusY: 0.5,
      width: image.naturalWidth || 1218,
      height: image.naturalHeight || 1962,
    };
  } catch (error) {
    URL.revokeObjectURL(src);
    throw error;
  }
}
