"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { capOption } from "@/lib/caps";
import { printedName } from "@/lib/lettering";
import { PackViewer } from "@/components/PackViewer";
import { artworkDownloadName, formatMacauTime, studioDownloadUrl, studioMediaUrl, type ArtworkSlot, type OrderPublic } from "@/lib/orderRecord";
import type { DesignState } from "@/lib/types";
import { logoutStudio } from "@/components/studio/StudioGate";

const SLOTS: { slot: ArtworkSlot; label: string }[] = [
  { slot: "label", label: "瓶身標籤" },
  { slot: "photo", label: "盒面主圖" },
  { slot: "name", label: "盒上名稱" },
  { slot: "side", label: "側板短句" },
];

export function OrderDetail({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderPublic | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch(`/api/studio/orders/${id}`)
      .then(async (response) => {
        const body = (await response.json()) as { order?: OrderPublic; error?: string };
        if (!response.ok || !body.order) throw new Error(body.error || "找不到訂單。");
        setOrder(body.order);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "找不到訂單。"));
  }, [id]);

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-800">
        {error}
      </p>
    );
  }
  if (!order) return <p className="text-sm text-muted">正在讀取訂單…</p>;

  const artwork = Object.fromEntries(
    SLOTS.filter((item) => order.images[item.slot]).map((item) => [item.slot, studioMediaUrl(order.id, item.slot)]),
  );
  const design: DesignState = {
    productId: order.productId,
    concentration: order.concentration,
    labelName: order.labelName,
    boxName: order.boxName,
    linkNames: true,
    sideTitle: order.sideTitle,
    capColor: capOption(order.capColor).id,
    photo: {
      src: order.images.photo ? studioMediaUrl(order.id, "photo") : "/graphics/aqua-night.jpg",
      alt: order.photoAlt,
      source: "shop",
      snap: true,
      zoom: 1,
      focusX: 0.5,
      focusY: 0.5,
      width: 1218,
      height: 1962,
    },
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/studio" className="text-sm text-muted underline decoration-line underline-offset-4">
            全部訂單
          </Link>
          <h1 className="mt-2 font-display text-4xl tracking-[0.08em]">{order.id}</h1>
          <p className="mt-1 text-sm text-muted">更新於 {formatMacauTime(order.updatedAt)}（澳門）</p>
        </div>
        <button type="button" onClick={() => void logoutStudio()} className="text-sm text-muted underline decoration-line underline-offset-4">
          登出
        </button>
      </header>
      <section className="border border-ink bg-ivory px-4 py-4">
        <h2 className="font-serif text-2xl">聯絡</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="簡稱" value={order.shortName || "（未填）"} />
          <Row label="電話" value={order.phone || "（未填）"} />
          <Row label="微信" value={order.wechat || "（未填）"} />
          <Row label="數量" value={order.quantity >= 1 ? `${order.quantity} 個` : "（未填）"} />
        </dl>
      </section>
      <PackViewer design={design} artwork={artwork} />
      <section className="border border-line bg-ivory px-4 py-4 text-sm">
        <p className="font-serif text-2xl">
          {order.scentZh}
          <span className="ml-2 text-base text-muted">{order.scentEn}</span>
        </p>
        <p className="mt-2">{order.tagline}</p>
        <p className="mt-2 text-muted">
          濃度 {Math.round(order.concentration)}%
        </p>
        <dl className="mt-4 space-y-2">
          <Row label="前調" value={order.notes.top.join(" · ")} />
          <Row label="中調" value={order.notes.middle.join(" · ")} />
          <Row label="後調" value={order.notes.base.join(" · ")} />
          <Row label="瓶蓋" value={capOption(order.capColor).label} />
          <Row label="標籤名稱" value={printedName(order.labelName).trim() || "（未填）"} />
          <Row label="盒上名稱" value={printedName(order.boxName).trim() || "（未填）"} />
          <Row label="側板短句" value={order.sideTitle || "（未填）"} />
          <Row label="盒面說明" value={order.photoAlt || "（未填）"} />
        </dl>
        {order.notesSource === "placeholder" ? <p className="mt-3 text-muted">香調標記為示意，不是官網配方。</p> : null}
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        {SLOTS.map((item) => (
          <figure key={item.slot} className="border border-line bg-ivory p-3">
            <figcaption className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span>{item.label}</span>
              {order.images[item.slot] ? (
                <a
                  href={studioDownloadUrl(order.id, item.slot)}
                  download={artworkDownloadName(order.id, item.slot)}
                  className={
                    item.slot === "photo"
                      ? "inline-flex h-9 items-center bg-ink px-3 text-ivory"
                      : "underline decoration-line underline-offset-4"
                  }
                >
                  下載
                </a>
              ) : null}
            </figcaption>
            {order.images[item.slot] ? (
              <img src={studioMediaUrl(order.id, item.slot)} alt={item.label} className="w-full bg-paper" />
            ) : (
              <p className="text-sm text-muted">未有圖片，立體預覽會用模型原圖。</p>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-3">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
