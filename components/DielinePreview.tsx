"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { clampFocus, clampZoom, coverRatios } from "@/lib/frame";
import { ART, PHOTO_SLOT, SLOTS, VIEWS, percentBox } from "@/lib/geometry";
import { BoxStoryBlock } from "@/components/BoxStoryBlock";
import { ClearBottlePreview, ClearLabelArtwork } from "@/components/ClearBottlePreview";
import { capOption } from "@/lib/caps";
import { clearLabelOption, labelStyleLabel } from "@/lib/clearLabel";
import { printedNameStyle } from "@/lib/lettering";
import type { DesignState, PhotoFrame, PreviewView } from "@/lib/types";

/**
 * Left column of the dieline, clear of the box (the box ink starts near x=796).
 * It covers the wraparound label and its 100mm / 45mm marks.
 */
const CLEAR_BOTTLE_STAGE = { x: 0, y: 0, w: 784, h: ART.h };

const VIEWS_UI: { id: PreviewView; label: string }[] = [
  { id: "full", label: "全圖" },
  { id: "label", label: "標籤" },
  { id: "front", label: "盒面" },
  { id: "side", label: "側板" },
];

type Props = {
  design: DesignState;
  view: PreviewView;
  onView: (view: PreviewView) => void;
  guides: {
    label: boolean;
    photo: boolean;
    boxName: boolean;
    side: boolean;
  };
  onPhoto: (photo: PhotoFrame) => void;
  /**
   * Gift-box step paints the official bottle photo for a clear label.
   * The result page turns this off and shows the live sticker instead.
   */
  bottlePhoto?: boolean;
  /** Inspect the artwork without dragging the box photo. */
  readOnly?: boolean;
  /** Result page can open the same preview larger. */
  zoomable?: boolean;
};

export function DielinePreview({
  design,
  view,
  onView,
  guides,
  onPhoto,
  bottlePhoto = true,
  readOnly = false,
  zoomable = false,
}: Props) {
  const percent = `${Math.round(design.concentration)}%`;
  const frame = VIEWS[view];
  const slotRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLButtonElement>(null);
  const photoRef = useRef(design.photo);
  const onPhotoRef = useRef(onPhoto);
  const [zoomed, setZoomed] = useState(false);
  const dragRef = useRef<{
    id: number;
    x: number;
    y: number;
    focusX: number;
    focusY: number;
  } | null>(null);

  useEffect(() => {
    photoRef.current = design.photo;
    onPhotoRef.current = onPhoto;
  });

  useEffect(() => {
    if (!zoomed) return;
    zoomRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setZoomed(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  useEffect(() => {
    if (readOnly) return;
    const el = slotRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      const current = photoRef.current;
      if (current.snap) return;
      event.preventDefault();
      onPhotoRef.current({
        ...current,
        zoom: clampZoom(current.zoom + (event.deltaY > 0 ? -0.06 : 0.06)),
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [readOnly]);

  const photo = design.photo;
  const clearLabel = design.labelStyle === "clear";
  const ratios = coverRatios(photo.width / photo.height, photo.snap ? 1 : photo.zoom);
  const focusX = clampFocus(photo.focusX, ratios.wRel);
  const focusY = clampFocus(photo.focusY, ratios.hRel);
  const canPan = !readOnly && !photo.snap && (ratios.wRel > 1.01 || ratios.hRel > 1.01);
  const styleLine = clearLabel
    ? `${labelStyleLabel("clear")} · ${clearLabelOption(design.labelColor).label}`
    : labelStyleLabel("classic");

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (readOnly || photoRef.current.snap) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      focusX: photoRef.current.focusX,
      focusY: photoRef.current.focusY,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const current = photoRef.current;
    if (readOnly || !drag || drag.id !== event.pointerId || current.snap) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const nextRatios = coverRatios(current.width / current.height, current.zoom);
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    onPhotoRef.current({
      ...current,
      focusX: clampFocus(drag.focusX - dx / (nextRatios.wRel * rect.width), nextRatios.wRel),
      focusY: clampFocus(drag.focusY - dy / (nextRatios.hRel * rect.height), nextRatios.hRel),
    });
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.id === event.pointerId) dragRef.current = null;
  }

  const preview = (
    <section className="border border-line bg-ivory" aria-label="即時預覽">
      <div className="flex items-end justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-muted uppercase">即時預覽</p>
          <p className="mt-1 font-display text-2xl leading-none text-ink tabular-nums">{percent}</p>
          {readOnly ? (
            <p className="mt-2 text-sm">
              瓶蓋 {capOption(design.capColor).label} · {styleLine}
            </p>
          ) : null}
        </div>
        {zoomable ? (
          <button
            ref={zoomRef}
            type="button"
            onClick={() => setZoomed((open) => !open)}
            className="h-10 shrink-0 border border-ink px-3 text-sm"
          >
            {zoomed ? "關閉" : "放大"}
          </button>
        ) : null}
      </div>

      <div className="flex gap-1 border-b border-line px-3 py-2" role="tablist" aria-label="預覽範圍">
        {VIEWS_UI.map((item) => {
          const selected = item.id === view;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onView(item.id)}
              className={`px-3 py-1.5 text-sm ${selected ? "bg-ink text-ivory" : "text-muted hover:text-ink"}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="bg-[#f3f1ec] p-3 sm:p-4">
        {clearLabel && view === "label" ? (
          bottlePhoto ? (
            <ClearBottlePreview capColor={design.capColor} labelColor={design.labelColor} labelName={design.labelName} />
          ) : (
            <div className="mx-auto w-full max-w-sm [container-type:size]" style={{ aspectRatio: "2 / 3" }}>
              <ClearLabelArtwork labelColor={design.labelColor} labelName={design.labelName} />
            </div>
          )
        ) : null}
        <div
          className={`relative mx-auto overflow-hidden bg-white ${clearLabel && view === "label" ? "hidden" : ""}`}
          style={{
            aspectRatio: `${frame.w} / ${frame.h}`,
            width: `min(100%, calc(78vh * ${frame.w} / ${frame.h}))`,
          }}
        >
          <div
            className="@container absolute"
            style={{
              width: `${(ART.w / frame.w) * 100}%`,
              height: `${(ART.h / frame.h) * 100}%`,
              left: `${(-frame.x / frame.w) * 100}%`,
              top: `${(-frame.y / frame.h) * 100}%`,
            }}
          >
            <img
              src="/dieline/base.jpg"
              alt="Topick 標籤與禮盒刀模。品牌標誌、二維碼、成分與公司資料保持原樣。"
              className="absolute inset-0 h-full w-full object-contain"
              draggable={false}
            />

            <div className="pointer-events-none absolute" style={percentBox(SLOTS.story)}>
              <BoxStoryBlock artwork story={design.boxStory} top={design.boxTop} middle={design.boxMiddle} base={design.boxBase} />
            </div>

            <div
              ref={slotRef}
              className={`absolute overflow-hidden bg-[#d7e3ef] ${canPan ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
              style={{
                ...percentBox(PHOTO_SLOT),
                boxShadow: guides.photo ? "inset 0 0 0 1px #a68456" : undefined,
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                draggable={false}
                className="absolute max-w-none"
                style={{
                  width: `${ratios.wRel * 100}%`,
                  height: `${ratios.hRel * 100}%`,
                  left: `${50 - focusX * ratios.wRel * 100}%`,
                  top: `${50 - focusY * ratios.hRel * 100}%`,
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-white"
                style={{ opacity: 0.38 * (1 - design.concentration / 100) }}
              />
            </div>

            {clearLabel ? null : (
              <NamePlate
                rectStyle={percentBox(SLOTS.labelName)}
                value={design.labelName}
                baseCqw={1.28}
                align="center"
                guided={guides.label}
              />
            )}
            {clearLabel && view === "full" ? (
              <div
                className="pointer-events-none absolute z-10 flex items-center justify-center overflow-hidden bg-white [container-type:size]"
                style={percentBox(CLEAR_BOTTLE_STAGE)}
              >
                {bottlePhoto ? (
                  <ClearBottlePreview
                    capColor={design.capColor}
                    labelColor={design.labelColor}
                    labelName={design.labelName}
                    fit="contain"
                  />
                ) : (
                  <ClearLabelArtwork labelColor={design.labelColor} labelName={design.labelName} />
                )}
              </div>
            ) : null}
            <NamePlate
              rectStyle={percentBox(SLOTS.boxName)}
              value={design.boxName}
              baseCqw={0.62}
              align="start"
              guided={guides.boxName}
            />
            <NamePlate
              rectStyle={percentBox(SLOTS.sideTitle)}
              value={design.sideTitle}
              baseCqw={0.58}
              align="start"
              guided={guides.side}
              cjk
            />
          </div>
        </div>
      </div>

      <p className="border-t border-line px-4 py-3 text-xs leading-relaxed text-muted">
        {view === "label"
          ? clearLabel
            ? bottlePhoto
              ? "透明標籤。瓶蓋、顏色同中間個名跟返上一步。"
              : "透明標籤。中間個名同顏色跟返你揀嘅。"
            : "標籤 100mm × 45mm。名稱只出現在中間，標誌與容量保持原樣。"
          : view === "side"
            ? readOnly
              ? "側板頂部那一行係你填嘅短句。下面的成分與公司資料保持原樣。"
              : "側板頂部那一行可以改。下面的成分與公司資料保持原樣。"
            : readOnly
              ? "盒面相框係你揀嘅圖。可以切換全圖、標籤、盒面同側板。"
              : photo.snap
                ? "這張圖已貼合盒面相框，不會鋪出相框。"
                : "拖移或滾輪只會改相框裡面的畫面，圖片不會鋪出相框。"}
        <span className="mt-1 block">濃度愈高，盒面愈實。</span>
      </p>
    </section>
  );

  if (zoomed) {
    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-3"
        role="presentation"
        onClick={() => setZoomed(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="放大即時預覽"
          className="max-h-full w-full max-w-5xl overflow-auto object-contain"
          onClick={(event) => event.stopPropagation()}
        >
          {preview}
        </div>
      </div>,
      document.body,
    );
  }

  return preview;
}

function NamePlate({
  rectStyle,
  value,
  baseCqw,
  align,
  guided,
  cjk = false,
}: {
  rectStyle: React.CSSProperties;
  value: string;
  baseCqw: number;
  align: "center" | "start";
  guided: boolean;
  cjk?: boolean;
}) {
  const text = value.trim();
  return (
    <div
      className={`pointer-events-none absolute flex overflow-hidden ${align === "center" ? "items-center justify-center text-center" : "items-start justify-start text-left"}`}
      style={{
        ...rectStyle,
        boxShadow: guided ? "inset 0 0 0 1px #a68456" : undefined,
      }}
    >
      <span
        className="block max-w-full px-[2%] text-ink"
        style={printedNameStyle(cjk && !text ? "香" : text || "NAME", baseCqw)}
      >
        {text || (align === "center" ? "名稱" : "名稱")}
      </span>
    </div>
  );
}
