import { capOption, type CapColor } from "@/lib/caps";
import { clearLabelOption, type ClearLabelColor } from "@/lib/clearLabel";
import { hasCjk, printedName } from "@/lib/lettering";
import type { CSSProperties } from "react";

/**
 * Label artwork on each official product photo, as a percentage of that photo.
 * The photos are not framed the same, so each cap has its own glass rectangle.
 * Ink is transparent everywhere else, so the glass and dip tube stay visible.
 */
export const CLEAR_BOTTLE_LABELS = {
  pink: { left: 45.14, top: 49.22, width: 12.71, height: 20.16 },
  purple: { left: 36.61, top: 49.03, width: 12.98, height: 20.78 },
  green: { left: 37.92, top: 51.76, width: 13.62, height: 21.93 },
  white: { left: 39.06, top: 55.93, width: 11.91, height: 18.97 },
} as const;

export const CLEAR_BOTTLE_LABEL = CLEAR_BOTTLE_LABELS.white;

type Props = {
  capColor: CapColor | string;
  labelColor: ClearLabelColor | string;
  labelName: string;
  className?: string;
};

/** Fit the product name to the label's open band. The unit is the band width, not the photo. */
function clearNameStyle(value: string): CSSProperties {
  const text = value.trim();
  const cjk = hasCjk(text);
  const glyphs = Math.max(Array.from(text).length, 1);
  const tracking = cjk ? 0.02 : glyphs > 16 ? 0.012 : glyphs > 11 ? 0.03 : 0.05;
  const advance = cjk ? 1.05 : 0.72;
  const ems = glyphs * advance + Math.max(0, glyphs - 1) * tracking;
  const size = Math.min(cjk ? 46 : 28, 94 / ems);
  return {
    fontSize: `${size.toFixed(2)}cqi`,
    letterSpacing: `${tracking}em`,
    textTransform: cjk ? "none" : "uppercase",
    fontFamily: cjk
      ? 'var(--font-noto-serif), "Songti TC", "PMingLiU", serif'
      : 'var(--font-cormorant), "Times New Roman", serif',
    fontWeight: 500,
    lineHeight: 1,
  };
}

export function ClearBottlePreview({ capColor, labelColor, labelName, className }: Props) {
  const bottle = capOption(capColor);
  const ink = clearLabelOption(labelColor);
  const trimmed = labelName.trim();
  const printed = trimmed ? printedName(trimmed) : "AQUA.CHL";
  const frame = CLEAR_BOTTLE_LABELS[bottle.id] ?? CLEAR_BOTTLE_LABEL;
  const name = {
    left: `${frame.left + frame.width * 0.04}%`,
    width: `${frame.width * 0.92}%`,
    top: `${frame.top + frame.height * 0.46}%`,
    height: `${frame.height * 0.22}%`,
  };

  return (
    <figure className={`@container relative mx-auto w-full ${className ?? "max-w-md"}`}>
      <img src={bottle.clear} alt="" className="w-full" />
      <img
        src={ink.src}
        alt=""
        className="pointer-events-none absolute"
        style={{ left: `${frame.left}%`, top: `${frame.top}%`, width: `${frame.width}%`, height: `${frame.height}%` }}
      />
      <div className="@container pointer-events-none absolute flex items-center justify-center text-center" style={name}>
        <span className="whitespace-nowrap" style={{ ...clearNameStyle(printed), color: trimmed ? ink.ink : `${ink.ink}59` }}>
          {printed}
        </span>
      </div>
      <figcaption className="sr-only">
        {ink.label}色透明標籤，{bottle.label}色瓶蓋。玻璃同吸管仍然睇到，只可以改中間個名。
      </figcaption>
    </figure>
  );
}
