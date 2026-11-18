"use client";

import { CAP_OPTIONS, capOption, type CapColor } from "@/lib/caps";
import { CLEAR_LABEL_OPTIONS, clearLabelOption, type ClearLabelColor, type LabelStyle } from "@/lib/clearLabel";
import { hasCjk, printedName } from "@/lib/lettering";

type Props = {
  labelName: string;
  capColor: CapColor;
  labelStyle: LabelStyle;
  labelColor: ClearLabelColor;
  onLabelName: (value: string) => void;
  onCapColor: (value: CapColor) => void;
  onLabelStyle: (value: LabelStyle) => void;
  onLabelColor: (value: ClearLabelColor) => void;
  onFocus: (active: boolean) => void;
};

export function LabelStep({
  labelName,
  capColor,
  labelStyle,
  labelColor,
  onLabelName,
  onCapColor,
  onLabelStyle,
  onLabelColor,
  onFocus,
}: Props) {
  const bottle = capOption(capColor);
  const clear = labelStyle === "clear";
  const ink = clearLabelOption(labelColor);
  const trimmed = labelName.trim();
  const cjk = hasCjk(trimmed);
  const printed = trimmed ? printedName(trimmed) : "AQUA.CHL";
  const length = printed.length;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">第二步</p>
        <h2 className="mt-2 font-serif text-3xl">瓶身標籤</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          只改標籤中間個名。可以揀原有標籤，或者透明標籤。透明標籤有陶、藍、金、綠四色。TOPICK、花紋、FRAGRANCE PALACE、EAU DE PARFUM 同 20ml 印死，不能改。再揀一顆瓶蓋。
        </p>
      </header>
      <label className="block">
        <span className="text-sm">產品名稱</span>
        <input
          value={labelName}
          maxLength={22}
          onChange={(event) => onLabelName(event.target.value)}
          onFocus={() => onFocus(true)}
          onBlur={() => onFocus(false)}
          className="mt-2 w-full border border-line bg-ivory px-3 py-3 font-display text-2xl tracking-[0.12em] uppercase outline-none focus:border-ink"
          placeholder="AQUA.CHL"
        />
      </label>
      <fieldset>
        <legend className="text-sm">標籤樣式</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(
            [
              ["classic", "原有標籤"],
              ["clear", "透明標籤"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={labelStyle === id}
              onClick={() => onLabelStyle(id)}
              className={`h-11 border text-sm ${labelStyle === id ? "border-ink bg-ink text-ivory" : "border-line bg-ivory"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      {clear ? (
        <fieldset>
          <legend className="text-sm">透明標籤顏色</legend>
          <ul className="mt-3 grid grid-cols-4 gap-2">
            {CLEAR_LABEL_OPTIONS.map((option) => {
              const selected = option.id === labelColor;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onLabelColor(option.id)}
                    className={`w-full border bg-white p-1 text-center ${selected ? "border-ink" : "border-line hover:border-gold"}`}
                  >
                    <img src={option.src} alt="" className="aspect-[2/3] w-full object-contain" />
                    <span className="mt-1 block text-sm">{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : null}
      <fieldset>
        <legend className="text-sm">瓶蓋</legend>
        <ul className="mt-3 grid grid-cols-4 gap-2">
          {CAP_OPTIONS.map((option) => {
            const selected = option.id === capColor;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onCapColor(option.id)}
                  className={`w-full border bg-ivory p-1.5 text-center ${selected ? "border-ink" : "border-line hover:border-gold"}`}
                >
                  <img src={option.thumb} alt="" className="aspect-square w-full object-cover" />
                  <span className="mt-1 block text-sm">{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>
      {clear ? (
        <figure className="@container relative mx-auto w-full max-w-md">
          <img src="/bottles/bottle-clear.png" alt="" className="w-full" />
          <img src={`/caps/cap-${capColor}.png`} alt="" className="pointer-events-none absolute object-contain" style={{ left: "31%", top: "2.5%", width: "38%", height: "28%" }} />
          <img src={ink.src} alt="" className="pointer-events-none absolute object-contain" style={{ left: "34.5%", top: "41.5%", width: "31%", height: "35%" }} />
          <div className="pointer-events-none absolute flex items-center justify-center overflow-hidden text-center" style={{ left: "32%", width: "36%", top: "55%", height: "7%" }}>
            <span
              className="font-display leading-none whitespace-nowrap"
              style={{
                color: trimmed ? ink.ink : `${ink.ink}59`,
                fontSize: length > 14 ? "2.6cqw" : length > 9 ? "3.1cqw" : "3.6cqw",
                letterSpacing: cjk && trimmed ? "0.06em" : "0.08em",
                textTransform: cjk && trimmed ? "none" : "uppercase",
              }}
            >
              {printed}
            </span>
          </div>
          <figcaption className="sr-only">{ink.label}色透明標籤，{bottle.label}色瓶蓋。只可以改中間個名。</figcaption>
        </figure>
      ) : (
        <figure className="@container relative mx-auto w-full max-w-md">
          <img src={bottle.bottle} alt={`${bottle.label}色瓶蓋的瓶身`} className="w-full" />
          <div
            className="pointer-events-none absolute flex items-center justify-center overflow-hidden text-center"
            style={{ left: "33%", width: "35%", top: "60.5%", height: "17.5%" }}
          >
            <span
              className={`font-display leading-none ${trimmed ? "text-[#1c1916]" : "text-[#1c1916]/35"}`}
              style={{
                fontSize: length > 14 ? "3.1cqw" : length > 9 ? "4cqw" : "4.8cqw",
                letterSpacing: cjk && trimmed ? "0.12em" : "0.18em",
                textTransform: cjk && trimmed ? "none" : "uppercase",
              }}
            >
              {printed}
            </span>
          </div>
          <figcaption className="sr-only">瓶身預覽，名稱會出現在標籤中間。</figcaption>
        </figure>
      )}
    </div>
  );
}
