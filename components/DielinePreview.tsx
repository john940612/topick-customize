"use client";

import { useEffect, useRef } from "react";
import { concentrationBand } from "@/lib/concentration";
import { clampFocus, clampZoom, coverRatios } from "@/lib/frame";
import { ART, PHOTO_SLOT, SLOTS, VIEWS, percentBox } from "@/lib/geometry";
import { printedNameStyle } from "@/lib/lettering";
import type { DesignState, PhotoFrame, PreviewView } from "@/lib/types";

const VIEWS_UI: { id: PreviewView; label: string }[] = [
  { id: "full", label: "全圖" },
  { id: "label", label: "標籤" },
  { id: "front", label: "盒面" },
  { id: "side", label: "側板" },
];

const FIXED_STORY = [
  "On a night by the sea, a gentle breeze stirs the air, bringing a sense of relaxed and natural charm. Conversations flow easily, with laughter filling the space.",
  "Top: Neroli Oil, Grapefruit, Mandarin, Bitter Orange Leaf",
  "Middle: Seaweed, Rosemary, Water",
  "Base: Cedarwood, Amber",
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
};

export function DielinePreview({ design, view, onView, guides, onPhoto }: Props) {
  const band = concentrationBand(design.concentration);
  const frame = VIEWS[view];
  const slotRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef(design.photo);
  const onPhotoRef = useRef(onPhoto);
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
  }, []);

  const photo = design.photo;
  const ratios = coverRatios(photo.width / photo.height, photo.snap ? 1 : photo.zoom);
  const focusX = clampFocus(photo.focusX, ratios.wRel);
  const focusY = clampFocus(photo.focusY, ratios.hRel);
  const canPan = !photo.snap && (ratios.wRel > 1.01 || ratios.hRel > 1.01);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (photoRef.current.snap) return;
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
    if (!drag || drag.id !== event.pointerId || current.snap) return;
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

  return (
    <section className="border border-line bg-ivory" aria-label="即時預覽">
      <div className="flex items-end justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-muted uppercase">即時預覽</p>
          <p className="mt-1 font-display text-2xl leading-none text-ink">
            {band.zh}
            <span className="ml-2 font-sans text-sm tracking-normal text-muted">{band.en}</span>
          </p>
        </div>
        <p className="text-right text-sm text-ink tabular-nums">{Math.round(design.concentration)}</p>
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
        <div
          className="relative mx-auto overflow-hidden bg-white"
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
              className="absolute inset-0 h-full w-full"
              draggable={false}
            />

            <div
              className="pointer-events-none absolute overflow-hidden text-[#2a2a2a]"
              style={percentBox(SLOTS.story)}
            >
              <p className="leading-[1.35]" style={{ fontSize: "0.30cqw" }}>
                {FIXED_STORY.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
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

            <NamePlate
              rectStyle={percentBox(SLOTS.labelName)}
              value={design.labelName}
              baseCqw={1.28}
              align="center"
              guided={guides.label}
            />
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
          ? "標籤 100mm × 45mm。名稱只出現在中間，標誌與容量保持原樣。"
          : view === "side"
            ? "側板頂部那一行可以改。下面的成分與公司資料保持原樣。"
            : photo.snap
              ? "這張圖已貼合盒面相框，不會鋪出相框。"
              : "拖移或滾輪只會改相框裡面的畫面，圖片不會鋪出相框。"}
        <span className="mt-1 block">{band.hint}。濃度愈高，盒面愈實。</span>
      </p>
    </section>
  );
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
