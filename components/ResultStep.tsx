"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import { concentrationBand } from "@/lib/concentration";
import { ORDER_ID_PATTERN, type OrderDraft } from "@/lib/orderRecord";
import { drawLabelCanvas, drawNamePlate, drawPhotoCanvas, drawSideAccent, loadImage } from "@/lib/packArt";
import type { CatalogProduct, DesignState } from "@/lib/types";

const PackViewer = dynamic(() => import("@/components/PackViewer").then((mod) => mod.PackViewer), {
  ssr: false,
  loading: () => <div className="h-[68vh] min-h-[420px] w-full animate-pulse bg-[#ece7df]" />,
});

const SESSION_KEY = "topick-order-v1";
const sessionListeners = new Set<() => void>();

function readOrderSession() {
  return sessionStorage.getItem(SESSION_KEY);
}

function writeOrderSession(value: { id: string; token: string }) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
  sessionListeners.forEach((listener) => listener());
}

function useOrderSession() {
  const raw = useSyncExternalStore(
    (listener) => {
      sessionListeners.add(listener);
      return () => sessionListeners.delete(listener);
    },
    readOrderSession,
    () => null,
  );
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { id?: string; token?: string };
    if (parsed.id && ORDER_ID_PATTERN.test(parsed.id) && parsed.token) {
      return { id: parsed.id, token: parsed.token };
    }
  } catch {
    return null;
  }
}

type Props = {
  product: CatalogProduct;
  design: DesignState;
};

export function ResultStep({ product, design }: Props) {
  const band = concentrationBand(design.concentration);
  const scent = product.seriesId === "wedding" ? product.nameEn : product.nameZh;
  const savedSession = useOrderSession();
  const orderId = savedSession?.id ?? null;
  const token = savedSession?.token ?? null;
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function save() {
    setStatus("saving");
    setMessage("");
    try {
      const draft: OrderDraft = {
        productId: product.id,
        scentZh: product.nameZh,
        scentEn: product.nameEn,
        tagline: product.tagline,
        notes: product.notes,
        notesSource: product.notesSource,
        concentration: design.concentration,
        concentrationZh: band.zh,
        concentrationEn: band.en,
        labelName: design.labelName,
        boxName: design.boxName,
        sideTitle: design.sideTitle,
        photoAlt: design.photo.alt,
      };
      const form = new FormData();
      form.set("meta", JSON.stringify(draft));
      if (orderId && token) {
        form.set("id", orderId);
        form.set("token", token);
      }
      if (design.labelName.trim()) form.set("label", await canvasFile(drawLabelCanvas(design.labelName), "label.png", "image/png"));
      if (design.boxName.trim()) form.set("name", await canvasFile(drawNamePlate(design.boxName), "name.png", "image/png"));
      if (design.sideTitle.trim()) form.set("side", await canvasFile(drawSideAccent(design.sideTitle), "side.png", "image/png"));
      const photo = await loadImage(design.photo.src);
      form.set("photo", await canvasFile(drawPhotoCanvas(photo, design.photo), "photo.jpg", "image/jpeg"));
      const response = await fetch("/api/orders", { method: "POST", body: form });
      const body = (await response.json()) as { id?: string; token?: string; error?: string };
      if (!response.ok || !body.id || !body.token) {
        throw new Error(body.error || "暫時未能儲存。");
      }
      writeOrderSession({ id: body.id, token: body.token });
      setStatus("saved");
      setMessage(orderId ? "已更新同一張訂單。" : "已儲存。請把編號交給工坊。");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "暫時未能儲存。");
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">最後結果</p>
        <h2 className="mt-2 font-serif text-3xl">您的瓶子與禮盒</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          拖動可以旋轉。標籤、盒面圖片、盒上名稱同側板短句會貼上您剛訂的內容。此為示範，不會落單。
        </p>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-ivory px-4 py-3">
        <div>
          <button
            type="button"
            onClick={() => void save()}
            disabled={status === "saving"}
            className="h-11 bg-ink px-5 text-sm text-ivory disabled:opacity-60"
          >
            {status === "saving" ? "儲存中…" : orderId ? "更新這張訂單" : "儲存這份訂製"}
          </button>
          {message ? (
            <p className={`mt-2 text-sm ${status === "error" ? "text-red-800" : "text-muted"}`} role={status === "error" ? "alert" : "status"}>
              {message}
            </p>
          ) : null}
        </div>
        {orderId ? (
          <p className="text-sm">
            訂單編號
            <span className="ml-2 font-display text-3xl tracking-[0.12em]">{orderId}</span>
          </p>
        ) : null}
      </div>
      <PackViewer design={design} />
      <section className="border border-line bg-ivory px-4 py-4 text-sm" aria-label="所選香氣">
        <p className="font-serif text-2xl">{scent}</p>
        <p className="mt-1 text-muted">
          {product.nameEn !== scent ? `${product.nameEn} · ` : ""}
          {band.zh} · {band.en}
        </p>
        <dl className="mt-3 space-y-1">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">前調</dt>
            <dd className="text-right">{product.notes.top.join(" · ")}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">中調</dt>
            <dd className="text-right">{product.notes.middle.join(" · ")}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">後調</dt>
            <dd className="text-right">{product.notes.base.join(" · ")}</dd>
          </div>
        </dl>
        {product.notesSource === "placeholder" ? (
          <p className="mt-3 text-muted">以上香調是示意，不是官網配方。</p>
        ) : null}
      </section>
    </div>
  );
}

function canvasFile(canvas: HTMLCanvasElement, filename: string, type: string) {
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("未能準備圖片。"));
          return;
        }
        resolve(new File([blob], filename, { type }));
      },
      type,
      0.86,
    );
  });
}
