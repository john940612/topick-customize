"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { artworkDownloadName, formatMacauTime, studioDownloadUrl, studioMediaUrl, type ArtworkSlot, type OrderSummary } from "@/lib/orderRecord";
import { logoutStudio } from "@/components/studio/StudioGate";

const THUMBS: { slot: ArtworkSlot; label: string }[] = [
  { slot: "label", label: "標籤" },
  { slot: "photo", label: "盒面" },
  { slot: "name", label: "名稱" },
  { slot: "side", label: "側板" },
];

export function OrderList() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState("");

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
                </p>
                <p className="mt-1 text-sm text-muted">
                  {order.scentZh}
                  <span className="ml-2">{order.scentEn}</span>
                </p>
              </Link>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div className="flex gap-2">
                  {THUMBS.map((thumb) =>
                    order.images[thumb.slot] ? (
                      <img
                        key={thumb.slot}
                        src={studioMediaUrl(order.id, thumb.slot)}
                        alt={thumb.label}
                        className="h-16 w-16 border border-line object-cover"
                      />
                    ) : (
                      <span key={thumb.slot} className="flex h-16 w-16 items-center justify-center border border-dashed border-line text-[11px] text-muted">
                        {thumb.label}
                      </span>
                    ),
                  )}
                </div>
                {order.images.photo ? (
                  <a
                    href={studioDownloadUrl(order.id, "photo")}
                    download={artworkDownloadName(order.id, "photo")}
                    className="inline-flex h-9 items-center bg-ink px-3 text-sm text-ivory"
                  >
                    下載盒面主圖
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
