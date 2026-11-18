export const LABEL_STYLES = ["classic", "clear"] as const;
export type LabelStyle = (typeof LABEL_STYLES)[number];

export const CLEAR_LABEL_COLORS = ["terracotta", "blue", "gold", "green"] as const;
export type ClearLabelColor = (typeof CLEAR_LABEL_COLORS)[number];

export const CLEAR_LABEL_OPTIONS: { id: ClearLabelColor; label: string; src: string; ink: string }[] = [
  { id: "terracotta", label: "陶", src: "/labels/clear-terracotta.png", ink: "#9e4a34" },
  { id: "blue", label: "藍", src: "/labels/clear-blue.png", ink: "#2e669e" },
  { id: "gold", label: "金", src: "/labels/clear-gold.png", ink: "#b89234" },
  { id: "green", label: "綠", src: "/labels/clear-green.png", ink: "#5c8c3a" },
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
  return style === "clear" ? "透明標籤" : "原有標籤";
}
