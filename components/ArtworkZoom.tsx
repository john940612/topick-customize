"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  src: string;
  alt: string;
  onClose: () => void;
  onDownload?: () => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 8;

export function ArtworkZoom({ src, alt, onClose, onDownload }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const movedRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    function applyScale(next: number) {
      const clamped = clamp(next, MIN_SCALE, MAX_SCALE);
      scaleRef.current = clamped;
      setScale(clamped);
      const limited = limitPan(offsetRef.current.x, offsetRef.current.y, clamped, imageRef.current);
      offsetRef.current = limited;
      setOffset(limited);
    }

    function onWheel(event: WheelEvent) {
      event.preventDefault();
      applyScale(scaleRef.current * (event.deltaY > 0 ? 0.9 : 1.1));
    }

    function onTouchStart(event: TouchEvent) {
      if (event.touches.length === 2) {
        pinchRef.current = { dist: touchDistance(event.touches), scale: scaleRef.current };
        dragRef.current = null;
      } else if (event.touches.length === 1 && !isControl(event.target)) {
        const touch = event.touches[0];
        dragRef.current = { x: touch.clientX - offsetRef.current.x, y: touch.clientY - offsetRef.current.y };
      }
    }

    function onTouchMove(event: TouchEvent) {
      if (event.touches.length === 2 && pinchRef.current) {
        event.preventDefault();
        movedRef.current = true;
        const next = pinchRef.current.scale * (touchDistance(event.touches) / pinchRef.current.dist);
        applyScale(next);
        return;
      }
      if (event.touches.length === 1 && dragRef.current && scaleRef.current > 1) {
        event.preventDefault();
        movedRef.current = true;
        const touch = event.touches[0];
        const limited = limitPan(touch.clientX - dragRef.current.x, touch.clientY - dragRef.current.y, scaleRef.current, imageRef.current);
        offsetRef.current = limited;
        setOffset(limited);
      }
    }

    function onTouchEnd(event: TouchEvent) {
      if (event.touches.length < 2) pinchRef.current = null;
      if (event.touches.length === 0) dragRef.current = null;
    }

    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchmove", onTouchMove, { passive: false });
    stage.addEventListener("touchend", onTouchEnd);
    stage.addEventListener("touchcancel", onTouchEnd);
    return () => {
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchmove", onTouchMove);
      stage.removeEventListener("touchend", onTouchEnd);
      stage.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  function zoomBy(factor: number) {
    const next = clamp(scaleRef.current * factor, MIN_SCALE, MAX_SCALE);
    scaleRef.current = next;
    setScale(next);
    const limited = limitPan(offsetRef.current.x, offsetRef.current.y, next, imageRef.current);
    offsetRef.current = limited;
    setOffset(limited);
  }

  function onPointerDown(event: React.PointerEvent<HTMLImageElement>) {
    if (event.pointerType === "touch") return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX - offsetRef.current.x, y: event.clientY - offsetRef.current.y };
  }

  function onPointerMove(event: React.PointerEvent<HTMLImageElement>) {
    if (!dragRef.current || event.pointerType === "touch" || scaleRef.current <= 1) return;
    movedRef.current = true;
    const limited = limitPan(event.clientX - dragRef.current.x, event.clientY - dragRef.current.y, scaleRef.current, imageRef.current);
    offsetRef.current = limited;
    setOffset(limited);
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  return createPortal(
    <div
      ref={stageRef}
      role="dialog"
      aria-modal="true"
      aria-label={`放大${alt}`}
      className="fixed inset-0 z-50 touch-none bg-night/90"
      onClick={() => {
        if (movedRef.current) {
          movedRef.current = false;
          return;
        }
        onClose();
      }}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-4 py-3" onClick={(event) => event.stopPropagation()}>
        <p className="text-sm text-ivory">{alt}</p>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="縮小" onClick={() => zoomBy(1 / 1.25)} className="h-10 w-10 border border-ivory/50 text-lg text-ivory">
            －
          </button>
          <button type="button" aria-label="放大" onClick={() => zoomBy(1.25)} className="h-10 w-10 border border-ivory/50 text-lg text-ivory">
            ＋
          </button>
          {onDownload ? (
            <button type="button" onClick={onDownload} className="h-10 border border-ivory/50 px-3 text-sm text-ivory">
              下載
            </button>
          ) : null}
          <button ref={closeRef} type="button" onClick={onClose} className="h-10 bg-ivory px-3 text-sm text-ink">
            關閉
          </button>
        </div>
      </div>
      <p className="pointer-events-none absolute inset-x-0 bottom-4 z-10 text-center text-xs text-ivory/80">雙指或滾輪放大，拖移可以睇</p>
      <div className="flex h-full items-center justify-center px-4 pb-12 pt-16">
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          draggable={false}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="max-h-full max-w-full cursor-grab touch-none select-none active:cursor-grabbing"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
        />
      </div>
    </div>,
    document.body,
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function touchDistance(touches: TouchList) {
  return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
}

function isControl(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("button"));
}

function limitPan(x: number, y: number, scale: number, image: HTMLImageElement | null) {
  if (!image || scale <= 1) return { x: 0, y: 0 };
  const maxX = (image.offsetWidth * (scale - 1)) / 2;
  const maxY = (image.offsetHeight * (scale - 1)) / 2;
  return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
}
