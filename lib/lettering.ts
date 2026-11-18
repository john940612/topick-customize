import type { CSSProperties } from "react";

export function hasCjk(value: string) {
  return /[\u3400-\u9fff]/.test(value);
}

export function printedNameStyle(value: string, baseCqw: number): CSSProperties {
  const length = value.trim().length;
  const scale = length > 16 ? 0.68 : length > 11 ? 0.82 : 1;
  const cjk = hasCjk(value);
  return {
    fontSize: `${(baseCqw * scale).toFixed(3)}cqw`,
    letterSpacing: cjk ? "0.08em" : "0.14em",
    textTransform: cjk ? "none" : "uppercase",
    fontFamily: cjk
      ? 'var(--font-noto-serif), "Songti TC", "PMingLiU", serif'
      : 'var(--font-cormorant), "Times New Roman", serif',
    fontWeight: 500,
    lineHeight: 1,
  };
}
