export const LABEL_STYLES = ["classic", "clear"] as const;
export type LabelStyle = (typeof LABEL_STYLES)[number];

export const CLEAR_LABEL_COLORS = ["terracotta", "blue", "gold", "green"] as const;
export type ClearLabelColor = (typeof CLEAR_LABEL_COLORS)[number];

/**
 * `src` is the flat label artwork that gets printed on the bottle.
 * `swatch` is a square thumbnail of the same artwork: the empty band in the
 * middle of the label is spliced out so the wordmark and the small print read
 * bigger inside a square colour cell. Same pixels otherwise — no retouching.
 */
export const CLEAR_LABEL_OPTIONS: { id: ClearLabelColor; label: string; src: string; swatch: string; ink: string }[] = [
  { id: "terracotta", label: "紅", src: "/labels/clear-terracotta.png", swatch: "/labels/swatch/clear-terracotta.png", ink: "#7c2e1c" },
  { id: "blue", label: "藍", src: "/labels/clear-blue.png", swatch: "/labels/swatch/clear-blue.png", ink: "#123a72" },
  { id: "gold", label: "金", src: "/labels/clear-gold.png", swatch: "/labels/swatch/clear-gold.png", ink: "#9c6c0e" },
  { id: "green", label: "綠", src: "/labels/clear-green.png", swatch: "/labels/swatch/clear-green.png", ink: "#285816" },
];

export function isLabelStyle(value: unknown): value is LabelStyle {
  return value === "classic" || value === "clear";
}

export function isClearLabelColor(value: unknown): value is ClearLabelColor {
  return typeof value === "string" && CLEAR_LABEL_COLORS.includes(value as ClearLabelColor);
}

export function clearLabelOption(id: string | undefined) {
  return CLEAR_LABEL_OPTIONS.find((item) => item.id === id) ?? CLEAR_LABEL_OPTIONS[0];
}

export function labelStyleLabel(style: string | undefined) {
  return style === "clear" ? "透明標籤" : "珠光霧面標籤";
}

/** Chinese characters, letters, and symbols each count as one. */
export const CLEAR_LABEL_NAME_LIMIT = 10;

export function limitClearLabelName(value: string) {
  return Array.from(value).slice(0, CLEAR_LABEL_NAME_LIMIT).join("");
}
