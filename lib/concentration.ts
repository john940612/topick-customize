/** Light formulas emphasise top notes; strong formulas emphasise the base. */
export function noteEmphasis(value: number) {
  const t = Math.min(100, Math.max(0, value)) / 100;
  return {
    top: 1 - t * 0.62,
    middle: 0.55 + t * 0.2,
    base: 0.28 + t * 0.72,
  };
}
