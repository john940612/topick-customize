"use client";

import { useEffect, useRef, useState } from "react";
import { ClearBottlePreview } from "@/components/ClearBottlePreview";
import { PreviewDisclaimer } from "@/components/PreviewDisclaimer";
import { FIELD_HINT_CLASS, fieldClass } from "@/lib/fieldStyles";
import { CAP_OPTIONS, capOption, type CapColor } from "@/lib/caps";
import { CLEAR_LABEL_NAME_LIMIT, CLEAR_LABEL_OPTIONS, labelStyleLabel, limitClearLabelName, type ClearLabelColor, type LabelStyle } from "@/lib/clearLabel";
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
  const [loadedCaps, setLoadedCaps] = useState<Record<string, boolean>>({});
  const [loadedLabels, setLoadedLabels] = useState<Record<string, boolean>>({});
  const clear = labelStyle === "clear";

  useEffect(() => {
    if (!clear) return;
    const limited = limitClearLabelName(labelName);
    if (limited !== labelName) onLabelName(limited);
  }, [clear, labelName, onLabelName]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">第二步</p>
        <h2 className="mt-2 font-serif text-3xl">瓶身標籤</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          只需改標籤中間的名稱，並選擇樣式同瓶蓋。品牌名、花紋同容量為固定印刷。
        </p>
      </header>
      <label className="block">
        <span className="text-sm">
          產品名稱
          <span className={FIELD_HINT_CLASS}>可輸入</span>
        </span>
        <input
          value={labelName}
          maxLength={clear ? CLEAR_LABEL_NAME_LIMIT : 22}
          onChange={(event) => onLabelName(clear ? limitClearLabelName(event.target.value) : event.target.value)}
          onFocus={() => onFocus(true)}
          onBlur={() => onFocus(false)}
          className={fieldClass("mt-2 font-display text-2xl tracking-[0.12em] uppercase")}
          placeholder="輸入產品名稱，例如 AQUA.CHL"
        />
        {clear ? <span className="mt-2 block text-sm text-muted">透明標籤的產品名稱最多 10 個字。</span> : null}
      </label>
      <fieldset>
        <legend className="text-sm">標籤樣式</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(
            [
              ["classic", labelStyleLabel("classic")],
              ["clear", labelStyleLabel("clear")],
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
          <p className="mt-2 text-sm text-muted">透明標籤可選紅、藍、金、綠四色。</p>
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
                    <span className="relative block aspect-[2/3] w-full bg-paper">
                      {loadedLabels[option.id] ? null : (
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] text-muted">載入中</span>
                      )}
                      <img
                        src={option.src}
                        alt=""
                        onLoad={() => setLoadedLabels((current) => ({ ...current, [option.id]: true }))}
                        className="h-full w-full object-contain"
                      />
                    </span>
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
                  <span className="relative block aspect-square w-full bg-paper">
                    {loadedCaps[option.id] ? null : (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] text-muted">載入中</span>
                    )}
                    <img
                      src={option.thumb}
                      alt=""
                      onLoad={() => setLoadedCaps((current) => ({ ...current, [option.id]: true }))}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="mt-1 block text-sm">{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>
      <LabelBottlePreview capColor={capColor} labelStyle={labelStyle} labelColor={labelColor} labelName={labelName} />
    </div>
  );
}

export function LabelBottlePreview({
  capColor,
  labelStyle,
  labelColor,
  labelName,
}: {
  capColor: CapColor;
  labelStyle: LabelStyle;
  labelColor: ClearLabelColor;
  labelName: string;
}) {
  const bottle = capOption(capColor);
  const imageRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const trimmed = labelName.trim();
  const cjk = hasCjk(trimmed);
  const printed = trimmed ? printedName(trimmed) : "AQUA.CHL";
  const length = printed.length;

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setReady(true);
  }, [bottle.bottle]);

  if (labelStyle === "clear") {
    return (
      <section className="border border-line bg-ivory" aria-label="即時預覽">
        <div className="flex items-end justify-between gap-3 border-b border-line px-4 py-3">
          <p className="text-[11px] tracking-[0.22em] text-muted uppercase">即時預覽</p>
          <div className="flex gap-2" aria-label="示意圖縮放">
            <button
              type="button"
              aria-label="縮小示意圖"
              disabled={zoom <= 1}
              onClick={() => setZoom((current) => Math.max(1, Math.round((current - 0.25) * 100) / 100))}
              className="h-9 border border-line bg-ivory px-3 text-sm disabled:opacity-40"
            >
              縮小
            </button>
            <button
              type="button"
              aria-label="放大示意圖"
              disabled={zoom >= 2}
              onClick={() => setZoom((current) => Math.min(2, Math.round((current + 0.25) * 100) / 100))}
              className="h-9 border border-line bg-ivory px-3 text-sm disabled:opacity-40"
            >
              放大
            </button>
          </div>
        </div>
        <div className="bg-[#f3f1ec] p-3 sm:p-4">
          <div className="mx-auto w-full max-w-md overflow-x-auto">
            <div style={{ width: `${zoom * 100}%` }}>
              <ClearBottlePreview capColor={capColor} labelColor={labelColor} labelName={labelName} className="max-w-none" />
            </div>
          </div>
        </div>
        <PreviewDisclaimer />
      </section>
    );
  }
  return (
    <section className="border border-line bg-ivory" aria-label="即時預覽">
      <div className="border-b border-line px-4 py-3">
        <p className="text-[11px] tracking-[0.22em] text-muted uppercase">即時預覽</p>
      </div>
      <div className="bg-[#f3f1ec] p-3 sm:p-4">
        <figure className="@container relative mx-auto w-full max-w-md" aria-label="已選瓶身">
          {!ready ? (
            <div className="flex aspect-[3/4] w-full items-center justify-center bg-ivory text-sm text-muted" role="status">
              瓶身載入中
            </div>
          ) : null}
          <img
            ref={imageRef}
            src={bottle.bottle}
            alt={`${bottle.label}色瓶蓋的瓶身`}
            onLoad={() => setReady(true)}
            className={`w-full ${ready ? "" : "absolute h-px w-px opacity-0"}`}
          />
          {ready ? (
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
          ) : null}
          <figcaption className="sr-only">珠光霧面標籤預覽，名稱會出現在標籤中間。</figcaption>
        </figure>
      </div>
      <PreviewDisclaimer />
    </section>
  );
}
