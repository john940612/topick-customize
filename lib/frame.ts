import { SLOT_ASPECT } from "@/lib/geometry";
import type { PhotoFrame, ShopGraphic } from "@/lib/types";

const ASPECT_TOLERANCE = 0.02;

export function aspectMatchesSlot(width: number, height: number) {
  if (width <= 0 || height <= 0) return false;
  const aspect = width / height;
  return Math.abs(aspect - SLOT_ASPECT) / SLOT_ASPECT <= ASPECT_TOLERANCE;
}

/** Width and height of the image relative to the slot, at this zoom. 1 means flush. */
export function coverRatios(imageAspect: number, zoom: number) {
  const z = Math.min(3, Math.max(1, zoom));
  if (!Number.isFinite(imageAspect) || imageAspect <= 0) {
    return { wRel: z, hRel: z };
  }
  if (imageAspect >= SLOT_ASPECT) {
    return { wRel: (imageAspect / SLOT_ASPECT) * z, hRel: z };
  }
  return { wRel: z, hRel: (SLOT_ASPECT / imageAspect) * z };
}

export function clampFocus(focus: number, rel: number) {
  if (rel <= 1.001) return 0.5;
  const min = 0.5 / rel;
  const max = (rel - 0.5) / rel;
  return Math.min(max, Math.max(min, focus));
}

export function clampZoom(zoom: number) {
  return Math.min(3, Math.max(1, zoom));
}

export function frameFromGraphic(graphic: ShopGraphic): PhotoFrame {
  return {
    src: graphic.src,
    alt: graphic.name,
    source: "shop",
    graphicId: graphic.id,
    snap: aspectMatchesSlot(graphic.width, graphic.height),
    zoom: 1,
    focusX: 0.5,
    focusY: 0.5,
    width: graphic.width,
    height: graphic.height,
  };
}
