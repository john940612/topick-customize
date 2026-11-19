import type { CSSProperties } from "react";

export function hasCjk(value: string) {
  return /[\u3400-\u9fff]/.test(value);
}

/** Latin names are printed in capitals. CJK is left as typed. */
export function printedName(value: string) {
  if (hasCjk(value)) return value;
  return value.toUpperCase();
}

/**
 * Gift-box copy: Zapf Humanist 601 Demi for Latin, PingFang Medium (Apple) or
 * Noto Sans TC Medium elsewhere for CJK. Wrap is loaded from public/fonts.
 */
export const BOX_FONT_FAMILY = 'var(--font-box), "Noto Sans TC", sans-serif';

export function printedNameStyle(value: string, baseCqw: number, target: "label" | "box" = "label"): CSSProperties {
  const length = value.trim().length;
  const scale = length > 16 ? 0.68 : length > 11 ? 0.82 : 1;
  const cjk = hasCjk(value);
  return {
    fontSize: `${(baseCqw * scale).toFixed(3)}cqw`,
    letterSpacing: cjk ? "0.08em" : "0.14em",
    textTransform: cjk ? "none" : "uppercase",
    fontFamily:
      target === "box"
        ? BOX_FONT_FAMILY
        : cjk
          ? 'var(--font-noto-serif), "Songti TC", "PMingLiU", serif'
          : 'var(--font-cormorant), "Times New Roman", serif',
    fontWeight: 500,
    lineHeight: 1,
  };
}
