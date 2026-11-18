export type ConcentrationBand = {
  zh: string;
  en: string;
  hint: string;
};

export function concentrationBand(value: number): ConcentrationBand {
  if (value < 25) {
    return {
      zh: "古龍水",
      en: "Eau de Cologne",
      hint: "清淡，前調較亮",
    };
  }
  if (value < 50) {
    return {
      zh: "淡香水",
      en: "Eau de Toilette",
      hint: "清爽，前調與中調並重",
    };
  }
  if (value < 75) {
    return {
      zh: "香精",
      en: "Eau de Parfum",
      hint: "飽滿，中調與後調更清楚",
    };
  }
  return {
    zh: "純香精",
    en: "Parfum",
    hint: "濃郁，後調留得最久",
  };
}

/** Light formulas emphasise top notes; strong formulas emphasise the base. */
export function noteEmphasis(value: number) {
  const t = Math.min(100, Math.max(0, value)) / 100;
  return {
    top: 1 - t * 0.62,
    middle: 0.55 + t * 0.2,
    base: 0.28 + t * 0.72,
  };
}
