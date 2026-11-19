/**
 * Shared look for every editable text field in the customisation flow.
 * The page background is paper (#f4f0e8) and the old fields used ivory + a
 * light `line` border, so they read as static labels instead of inputs.
 * White fill, a visible ink border and a gold focus ring make them obviously typeable.
 */
export const FIELD_BASE =
  "w-full border border-ink/30 bg-white px-3 py-3 text-ink shadow-[inset_0_1px_2px_rgba(27,24,20,0.06)] outline-none transition-colors placeholder:text-ink/35 hover:border-gold focus:border-ink focus:ring-2 focus:ring-gold/40 disabled:bg-ivory disabled:text-muted";

export function fieldClass(extra = "") {
  return `${FIELD_BASE}${extra ? ` ${extra}` : ""}`;
}

/** Small inline cue next to the label so nobody mistakes a field for static text. */
export const FIELD_HINT_CLASS = "ml-2 align-middle text-[11px] tracking-[0.16em] text-gold-dark";
