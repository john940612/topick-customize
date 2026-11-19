"use client";

import { useRef, useState } from "react";
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
  pink: { left: 45.14, top: 55.22, width: 12.71, height: 20.16 },
  purple: { left: 36.61, top: 55.03, width: 12.98, height: 20.78 },
  green: { left: 37.92, top: 57.76, width: 13.62, height: 21.93 },
  white: { left: 39.06, top: 61.93, width: 11.91, height: 18.97 },
} as const;

export const CLEAR_BOTTLE_LABEL = CLEAR_BOTTLE_LABELS.white;

type Props = {
  capColor: CapColor | string;
  labelColor: ClearLabelColor | string;
  labelName: string;
  className?: string;
  /**
   * `contain` fits the official bottle photo inside a sized container
   * (the dieline’s label column). The default fills the available width.
   */
  fit?: "width" | "contain";
};

/** Fit the product name to the label's open band. The unit is the band width, not the photo. */
function clearNameStyle(value: string): CSSProperties {
  const text = value.trim();
  const cjk = hasCjk(text);
  const glyphs = Math.max(Array.from(text).length, 1);
  const tracking = cjk ? 0.02 : glyphs > 16 ? 0.012 : glyphs > 11 ? 0.03 : 0.05;
  const advance = cjk ? 1.05 : 0.72;
  const ems = glyphs * advance + Math.max(0, glyphs - 1) * tracking;
  const size = Math.min(cjk ? 22 : 28, 94 / ems);
  return {
    fontSize: `${size.toFixed(2)}cqi`,
    letterSpacing: `${tracking}em`,
    textTransform: cjk ? "none" : "uppercase",
    fontFamily: cjk
      ? 'var(--font-noto-serif), "Songti TC", "PMingLiU", serif'
      : 'var(--font-cormorant), "Times New Roman", serif',
    fontWeight: 500,
    // Cormorant’s Q tail sits about 0.25em under the baseline, past a 1em line box.
    lineHeight: 1.7,
    paddingBottom: "0.08em",
  };
}

type Shown = { bottle: string; label: string; ink: string; cap: CapColor };

/** The transparent sticker itself, without the official bottle photograph. */
export function ClearLabelArtwork({
  labelColor,
  labelName,
  className,
}: {
  labelColor: ClearLabelColor | string;
  labelName: string;
  className?: string;
}) {
  const ink = clearLabelOption(labelColor);
  const trimmed = labelName.trim();
  const printed = trimmed ? printedName(trimmed) : "AQUA.CHL";
  return (
    <figure
      className={`relative ${className ?? ""}`}
      style={{ width: "min(100cqw, calc(100cqh * 2 / 3))", aspectRatio: "2 / 3" }}
    >
      <img src={ink.src} alt="" className="h-full w-full object-contain" />
      <div
        className="@container pointer-events-none absolute flex items-center justify-center overflow-visible text-center"
        style={{ left: "4%", width: "92%", top: "40%", height: "36%" }}
      >
        <span className="whitespace-nowrap" style={{ ...clearNameStyle(printed), color: trimmed ? ink.ink : `${ink.ink}59` }}>
          {printed}
        </span>
      </div>
      <figcaption className="sr-only">
        {ink.label}色透明標籤，中間個名係{printed}。
      </figcaption>
    </figure>
  );
}

const BOTTLE_RATIO = 1536 / 1450;

export function ClearBottlePreview({ capColor, labelColor, labelName, className, fit = "width" }: Props) {
  const bottle = capOption(capColor);
  const ink = clearLabelOption(labelColor);
  const trimmed = labelName.trim();
  const printed = trimmed ? printedName(trimmed) : "AQUA.CHL";
  const arrived = useRef({ bottle: "", label: "" });
  const [shown, setShown] = useState<Shown | null>(null);
  const [ratio, setRatio] = useState(BOTTLE_RATIO);
  const contain = fit === "contain";
  const frame = CLEAR_BOTTLE_LABELS[shown?.cap ?? bottle.id] ?? CLEAR_BOTTLE_LABEL;
  const ready = shown?.bottle === bottle.clear && shown?.label === ink.src;
  const name = {
    left: `${frame.left + frame.width * 0.04}%`,
    width: `${frame.width * 0.92}%`,
    // Open band between FRAGRANCE PALACE (ends ~36% of the artwork) and EAU DE PARFUM (starts ~79%).
    top: `${frame.top + frame.height * 0.4}%`,
    height: `${frame.height * 0.36}%`,
  };

  function note(part: "bottle" | "label", src: string, image?: HTMLImageElement) {
    if (part === "bottle" && image?.naturalWidth && image.naturalHeight) {
      setRatio(image.naturalWidth / image.naturalHeight);
    }
    const next = { ...arrived.current, [part]: src };
    arrived.current = next;
    if (next.bottle === bottle.clear && next.label === ink.src) {
      setShown({ bottle: bottle.clear, label: ink.src, ink: ink.ink, cap: bottle.id });
    }
  }

  return (
    <figure
      className={contain ? "@container relative h-auto max-h-full max-w-full" : `@container relative mx-auto w-full ${className ?? "max-w-md"}`}
      style={contain ? { width: `min(100cqw, calc(100cqh * ${ratio}))`, aspectRatio: ratio } : undefined}
    >
      {shown ? (
        <>
          <img src={shown.bottle} alt="" className="w-full" />
          <img
            src={shown.label}
            alt=""
            className="pointer-events-none absolute"
            style={{ left: `${frame.left}%`, top: `${frame.top}%`, width: `${frame.width}%`, height: `${frame.height}%` }}
          />
          <div className="@container pointer-events-none absolute flex items-center justify-center overflow-visible text-center" style={name}>
            <span className="whitespace-nowrap" style={{ ...clearNameStyle(printed), color: trimmed ? shown.ink : `${shown.ink}59` }}>
              {printed}
            </span>
          </div>
        </>
      ) : (
        <div className="aspect-[1536/1450] w-full bg-white" style={contain ? { aspectRatio: ratio } : undefined} />
      )}
      <img
        key={bottle.clear}
        alt=""
        src={bottle.clear}
        className="pointer-events-none absolute h-px w-px opacity-0"
        onLoad={(event) => note("bottle", bottle.clear, event.currentTarget)}
        onError={() => note("bottle", bottle.clear)}
      />
      <img key={ink.src} alt="" src={ink.src} className="pointer-events-none absolute h-px w-px opacity-0" onLoad={() => note("label", ink.src)} onError={() => note("label", ink.src)} />
      {ready ? null : (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm text-muted" role="status">
          載入中
        </div>
      )}
      <figcaption className="sr-only">
        {ink.label}色透明標籤，{bottle.label}色瓶蓋。玻璃同吸管仍然睇到，只可以改中間個名。
      </figcaption>
    </figure>
  );
}
