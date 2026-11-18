"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { capOption } from "@/lib/caps";
import { clearLabelOption, labelStyleLabel } from "@/lib/clearLabel";
import { boxNoteLines } from "@/lib/boxCopy";
import { ArtworkZoom } from "@/components/ArtworkZoom";
import { BoxStoryBlock } from "@/components/BoxStoryBlock";
import { ClearBottlePreview } from "@/components/ClearBottlePreview";
import { downloadBoxFront } from "@/lib/boxFrontExport";
import { formatMacauTime, studioMediaUrl, type ArtworkSlot, type OrderSummary } from "@/lib/orderRecord";
import { prefetchStudioMedia, saveStudioArtwork } from "@/lib/saveFile";
import type { DesignState } from "@/lib/types";
import { logoutStudio } from "@/components/studio/StudioGate";

const THUMBS: { slot: ArtworkSlot; label: string; download: string }[] = [
  { slot: "label", label: "標籤", download: "下載標籤" },
  { slot: "photo", label: "盒面主圖", download: "下載盒面主圖" },
  { slot: "name", label: "名稱", download: "下載名稱" },
  { slot: "side", label: "側板", download: "下載側板" },
];

export function OrderList() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [zoom, setZoom] = useState<{ id: string; slot: ArtworkSlot; alt: string } | null>(null);

  async function downloadSlot(id: string, slot: ArtworkSlot) {
    setDownloadError("");
    try {
      await saveStudioArtwork(id, slot);
    } catch (reason) {
      setDownloadError(reason instanceof Error ? reason.message : "暫時未能下載。");
    }
  }

  useEffect(() => {
    void fetch("/api/studio/orders")
      .then(async (response) => {
        const body = (await response.json()) as { orders?: OrderSummary[]; error?: string };
        if (!response.ok) throw new Error(body.error || "暫時未能讀取訂單。");
        setOrders(body.orders ?? []);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "暫時未能讀取訂單。"));
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">Studio</p>
          <h1 className="mt-2 font-serif text-4xl">工坊訂單</h1>
        </div>
        <button type="button" onClick={() => void logoutStudio()} className="text-sm text-muted underline decoration-line underline-offset-4">
          登出
        </button>
      </header>
      {error ? (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {orders === null && !error ? <p className="text-sm text-muted">正在讀取訂單…</p> : null}
      {orders?.length === 0 ? <p className="text-sm text-muted">尚未有訂單。</p> : null}
      <ul className="space-y-4">
        {orders?.map((order) => (
          <li key={order.id}>
            <div className="border border-line bg-ivory p-4">
              <Link href={`/studio/${order.id}`} className="block hover:text-gold-dark">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-3xl tracking-[0.08em]">{order.id}</p>
                  <p className="text-sm text-muted">{formatMacauTime(order.updatedAt)}</p>
                </div>
                <p className="mt-2 text-sm">
                  <span className="font-medium">{order.shortName || "未留簡稱"}</span>
                  <span className="mx-2 text-muted">·</span>
                  {order.phone || "未留電話"}
                  <span className="mx-2 text-muted">·</span>
                  微信 {order.wechat || "未留"}
                  <span className="mx-2 text-muted">·</span>
                  {order.quantity >= 1 ? `${order.quantity} 個` : "未填數量"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {order.scentZh}
                  <span className="ml-2">{order.scentEn}</span>
                  <span className="ml-2">瓶蓋 {capOption(order.capColor).label}</span>
                  <span className="ml-2">
                    {order.labelStyle === "clear"
                      ? `${labelStyleLabel("clear")} · ${clearLabelOption(order.labelColor).label}`
                      : labelStyleLabel("classic")}
                  </span>
                  <span className="ml-2">盒上名稱 {order.boxName || "（未填）"}</span>
                </p>
                {order.labelStyle === "clear" ? (
                  <div className="mt-3 max-w-[11rem]">
                    <ClearBottlePreview capColor={order.capColor} labelColor={order.labelColor} labelName={order.labelName} className="max-w-none" />
                  </div>
                ) : null}
                <div className="mt-3 max-w-xl">
                  <BoxStoryBlock
                    story={order.boxStory}
                    top={boxNoteLines(order.notes).boxTop}
                    middle={boxNoteLines(order.notes).boxMiddle}
                    base={boxNoteLines(order.notes).boxBase}
                  />
                </div>
              </Link>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div className="flex gap-2">
                  {THUMBS.map((thumb) =>
                    order.images[thumb.slot] ? (
                      <button
                        key={thumb.slot}
                        type="button"
                        aria-label={`放大${thumb.label}`}
                        onClick={() => setZoom({ id: order.id, slot: thumb.slot, alt: `${order.id} ${thumb.label}` })}
                        className="h-16 w-16 border border-line bg-ivory"
                      >
                        <img
                          src={studioMediaUrl(order.id, thumb.slot)}
                          alt=""
                          onLoad={() => prefetchStudioMedia(order.id, thumb.slot)}
                          className="h-full w-full object-contain"
                        />
                      </button>
                    ) : (
                      <span key={thumb.slot} className="flex h-16 w-16 items-center justify-center border border-dashed border-line text-[11px] text-muted">
                        {thumb.label}
                      </span>
                    ),
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {THUMBS.filter((thumb) => order.images[thumb.slot]).map((thumb) => (
                    <button
                      key={thumb.slot}
                      type="button"
                      onClick={() => void downloadSlot(order.id, thumb.slot)}
                      className="inline-flex h-9 items-center border border-ink px-3 text-sm"
                    >
                      {thumb.download}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => void downloadBoxFront(frontDesign(order), `${order.id}-box-front.png`)}
                    className="inline-flex h-9 items-center bg-ink px-3 text-sm text-ivory"
                  >
                    下載盒面
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {downloadError ? (
        <p role="alert" className="text-sm text-red-800">
          {downloadError}
        </p>
      ) : null}
      {zoom ? (
        <ArtworkZoom
          src={studioMediaUrl(zoom.id, zoom.slot)}
          alt={zoom.alt}
          onClose={() => setZoom(null)}
          onDownload={() => void downloadSlot(zoom.id, zoom.slot)}
        />
      ) : null}
    </div>
  );
}

function frontDesign(order: OrderSummary): DesignState {
  return {
    productId: "",
    concentration: 0,
    labelName: order.labelName,
    boxName: order.boxName,
    linkNames: true,
    sideTitle: "",
    boxStory: order.boxStory,
    ...boxNoteLines(order.notes),
    capColor: order.capColor,
    labelStyle: order.labelStyle === "clear" ? "clear" : "classic",
    labelColor: order.labelColor === "blue" || order.labelColor === "gold" || order.labelColor === "green" ? order.labelColor : "terracotta",
    photo: {
      src: order.images.photo ? studioMediaUrl(order.id, "photo") : "/graphics/aqua-night.jpg",
      alt: "盒面主圖",
      source: "shop",
      snap: true,
      zoom: 1,
      focusX: 0.5,
      focusY: 0.5,
      width: 1218,
      height: 1962,
    },
  };
}
