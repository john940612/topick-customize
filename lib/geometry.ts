import type { CSSProperties } from "react";

export const ART = { w: 1862, h: 1280 } as const;

/** Box-front photograph window, measured on the dieline. */
export const PHOTO_SLOT = { x: 1066, y: 435, w: 203, h: 327 } as const;

export const SLOT_ASPECT = PHOTO_SLOT.w / PHOTO_SLOT.h;

export type Rect = { x: number; y: number; w: number; h: number };

export const SLOTS = {
  labelName: { x: 150, y: 648, w: 476, h: 92 },
  boxName: { x: 1070, y: 902, w: 150, h: 40 },
  sideTitle: { x: 1564, y: 352, w: 198, h: 78 },
  story: { x: 1072, y: 770, w: 186, h: 124 },
} as const satisfies Record<string, Rect>;

export const VIEWS: Record<
  "full" | "label" | "front" | "side",
  Rect
> = {
  full: { x: 0, y: 0, w: ART.w, h: ART.h },
  label: { x: 0, y: 410, w: 760, h: 410 },
  front: { x: 1024, y: 150, w: 290, h: 820 },
  side: { x: 1520, y: 310, w: 290, h: 520 },
};

export function percentBox(rect: Rect): CSSProperties {
  return {
    left: `${(rect.x / ART.w) * 100}%`,
    top: `${(rect.y / ART.h) * 100}%`,
    width: `${(rect.w / ART.w) * 100}%`,
    height: `${(rect.h / ART.h) * 100}%`,
  };
}
