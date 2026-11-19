"use client";

import { useState } from "react";
import { aspectMatchesSlot } from "@/lib/frame";
import { hasCjk } from "@/lib/lettering";
import type { PhotoFrame, ShopGraphic } from "@/lib/types";

type Props = {
  graphics: ShopGraphic[];
  boxName: string;
  linkNames: boolean;
  sideTitle: string;
  sideOfficial: boolean;
  photo: PhotoFrame;
  onBoxName: (value: string) => void;
  onLinkNames: (linked: boolean) => void;
  onSideTitle: (value: string) => void;
  onPhoto: (photo: PhotoFrame) => void;
  onZoom: (zoom: number) => void;
  boxStory: string;
  onBoxStory: (value: string) => void;
  onFocus: (slot: "boxName" | "side" | "photo" | "copy" | null) => void;
};

export function BoxStep({
  graphics,
  boxName,
  linkNames,
  sideTitle,
  sideOfficial,
  photo,
  boxStory,
  onBoxName,
  onLinkNames,
  onBoxStory,
  onSideTitle,
  onPhoto,
  onZoom,
  onFocus,
}: Props) {
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("請上傳 JPG、PNG 或 WebP。");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("圖片請小於 10MB。");
      return;
    }
    try {
      const loaded = await readImage(file);
      const snap = aspectMatchesSlot(loaded.width, loaded.height);
      onPhoto({
        src: loaded.src,
        alt: file.name,
        source: "upload",
        snap,
        zoom: 1,
        focusX: 0.5,
        focusY: 0.5,
        width: loaded.width,
        height: loaded.height,
      });
      onFocus("photo");
    } catch {
      setError("這張圖片無法顯示。");
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">第三步</p>
        <h2 className="mt-2 font-serif text-3xl">禮盒</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          可改盒面主圖、相片下面的說明、右側面板頂部那一行，以及盒上產品名稱。前調、中調同後調跟返支香，不能改。二維碼、成分、公司資料、20ml 同刀模摺線保持不動。
        </p>
      </header>

      <section>
        <h3 className="font-serif text-2xl">盒面主圖</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          店方圖庫已按相框比例做好，選了就直接貼上。自行上傳若比例不同，只可在相框內拖移及縮放，超出部分會被裁走，不會拉滿成個禮盒。
        </p>
        <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {graphics
            .filter((graphic) => graphic.series !== "五行系列")
            .map((graphic) => {
            const selected = photo.source === "shop" && photo.graphicId === graphic.id;
            return (
              <li key={graphic.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    onPhoto({
                      src: graphic.src,
                      alt: graphic.name,
                      source: "shop",
                      graphicId: graphic.id,
                      snap: true,
                      zoom: 1,
                      focusX: 0.5,
                      focusY: 0.5,
                      width: graphic.width,
                      height: graphic.height,
                    });
                    onFocus("photo");
                    setError(null);
                  }}
                  className={`w-full border text-left ${selected ? "border-ink" : "border-line hover:border-gold"}`}
                >
                  <img src={graphic.src} alt="" className="aspect-[203/327] w-full object-cover" />
                  <span className="block px-1.5 py-1.5 text-[11px] leading-tight">
                    {graphic.name}
                    <span className="block text-muted">{graphic.series}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-l-2 border-gold bg-ivory px-4 py-4 sm:px-5">
          <p id="own-photo-hint" className="text-sm text-gold-dark">
            用自己的照片做盒面主圖
          </p>
          <label className="mt-3 flex h-12 w-full cursor-pointer items-center justify-center border-b-2 border-gold bg-ink px-6 text-sm text-ivory focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gold sm:inline-flex sm:w-auto sm:min-w-64">
            上傳自己的圖片
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              aria-describedby="own-photo-hint"
              className="sr-only"
              onChange={(event) => {
                void onFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          <p className="mt-3 text-sm text-muted">
            {photo.source === "upload" ? `已上傳：${photo.alt}` : "尚未上傳"}
            {photo.source === "upload" && photo.snap ? " · 比例貼合，已直接放入" : ""}
            {photo.source === "upload" && !photo.snap ? " · 比例不同，請在相框內調整" : ""}
          </p>
        </div>
        {error ? (
          <p role="alert" className="mt-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {!photo.snap ? (
          <label className="mt-5 block">
            <span className="flex justify-between text-sm">
              <span>相框內縮放</span>
              <span className="tabular-nums">{photo.zoom.toFixed(2)}×</span>
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={photo.zoom}
              onChange={(event) => onZoom(Number(event.target.value))}
              className="mt-2 w-full accent-gold"
            />
            <span className="mt-1 block text-sm text-muted">在預覽的相框上按住拖移，可移動畫面。滾輪亦可縮放。</span>
          </label>
        ) : null}
      </section>

      <label className="block text-sm" onFocus={() => onFocus("copy")} onBlur={() => onFocus(null)}>
        相片下面的說明
        <textarea
          value={boxStory}
          maxLength={800}
          rows={4}
          onChange={(event) => onBoxStory(event.target.value)}
          className="mt-2 w-full border border-line bg-ivory px-3 py-3 outline-none focus:border-ink"
        />
        <span className="mt-2 block text-muted">說明下面有一條線，接著是呢支香固定的前調、中調同後調，呢三行不能改。</span>
      </label>

      <label className="block">
        <span className="text-sm">側板頂部短句</span>
        <input
          value={sideTitle}
          maxLength={16}
          onChange={(event) => onSideTitle(event.target.value)}
          onFocus={() => onFocus("side")}
          onBlur={() => onFocus(null)}
          className="mt-2 w-full border border-line bg-ivory px-3 py-3 font-serif text-xl outline-none focus:border-ink"
        />
        <span className="mt-2 block text-sm text-muted">
          {sideOfficial
            ? "刀模右側上方那一行可以改。預設寫成水生香調，可改成您想印的短句。"
            : "刀模原句屬於 AQUA.CHL。其他香氣這裡是建議短句，不是官網盒面原文，可自行修改。"}
        </span>
      </label>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm">盒上產品名稱</span>
          <input
            value={boxName}
            maxLength={22}
            disabled={linkNames}
            onChange={(event) => onBoxName(event.target.value)}
            onFocus={() => onFocus("boxName")}
            onBlur={() => onFocus(null)}
            className={`mt-2 w-full border border-line bg-ivory px-3 py-3 font-display text-2xl tracking-[0.12em] outline-none focus:border-ink disabled:text-muted ${hasCjk(boxName) ? "" : "uppercase"}`}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={linkNames}
            onChange={(event) => onLinkNames(event.target.checked)}
            className="accent-ink"
          />
          跟標籤名稱
        </label>
      </div>
    </div>
  );
}

function readImage(file: File) {
  return new Promise<{ src: string; width: number; height: number }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const src = String(reader.result);
      const image = new Image();
      image.onload = () => resolve({ src, width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("decode"));
      image.src = src;
    };
    reader.readAsDataURL(file);
  });
}
