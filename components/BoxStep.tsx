"use client";

import { useState, type ReactNode } from "react";
import { aspectMatchesSlot } from "@/lib/frame";
import { FIELD_HINT_CLASS, fieldClass } from "@/lib/fieldStyles";
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
  /**
   * Live preview, rendered directly under the photo controls so the framed
   * result is visible as soon as a picture is picked or the zoom is dragged.
   */
  preview?: ReactNode;
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
  preview,
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
          可改主圖、圖片說明、側板短句同產品名稱。香調、二維碼同公司資料保持原樣。
        </p>
      </header>

      <section>
        <h3 className="font-serif text-2xl">盒面主圖</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          圖庫圖片已按相框比例準備，選定後會直接貼上。自行上傳若比例不同，只可在相框內拖移及縮放，超出部分會被裁去，不會拉滿整個禮盒。
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

      {preview ? <div className="mt-6">{preview}</div> : null}

      <div className="mb-3">
        <h3 className="font-serif text-2xl text-ink md:text-[28px]">禮盒文字設計</h3>
        <p className="mb-3 mt-1 text-sm tracking-[0.08em] text-muted">印刷字型示意</p>
        <div className="grid grid-cols-2 items-stretch gap-3">
          <figure className="flex flex-col rounded-sm border border-line bg-ivory px-2 py-1.5">
            <div className="flex flex-1 items-center">
              <img src="/fonts/samples/chinese.png" alt="中文字型示範" className="block h-auto w-full" />
            </div>
            <figcaption className="mt-1 text-center text-[11px] tracking-[0.06em] text-muted">中文</figcaption>
          </figure>
          <figure className="flex flex-col rounded-sm border border-line bg-ivory px-2 py-1.5">
            <div className="flex flex-1 items-center">
              <img src="/fonts/samples/zapf-english.png" alt="英文示範文字" className="block h-auto w-full" />
            </div>
            <figcaption className="mt-1 text-center text-[11px] tracking-[0.06em] text-muted">英文</figcaption>
          </figure>
        </div>
      </div>

      <label className="block text-sm" onFocus={() => onFocus("copy")} onBlur={() => onFocus(null)}>
        <span>
          相片下面的說明
          <span className={FIELD_HINT_CLASS}>可輸入</span>
        </span>
        <textarea
          value={boxStory}
          maxLength={800}
          rows={4}
          placeholder="輸入相片下面的說明文字…"
          onChange={(event) => onBoxStory(event.target.value)}
          className={fieldClass("mt-2 resize-y leading-relaxed")}
        />
        <span className="mt-2 block text-muted">說明下方有一條線，接著是這支香固定的前調、中調與後調，這三行不能修改。</span>
      </label>

      <label className="block">
        <span className="text-sm">
          側板頂部短句
          <span className={FIELD_HINT_CLASS}>可輸入</span>
        </span>
        <input
          value={sideTitle}
          maxLength={16}
          placeholder="輸入側板頂部短句…"
          onChange={(event) => onSideTitle(event.target.value)}
          onFocus={() => onFocus("side")}
          onBlur={() => onFocus(null)}
          className={fieldClass("mt-2 font-serif text-xl")}
        />
        <span className="mt-2 block text-sm text-muted">
          {sideOfficial
            ? "側板頂部這一行可以修改。預設為水生香調，您可以改成想印的短句。"
            : "這句預設來自 AQUA.CHL。其他香氣這裡是建議短句，不是官網盒面原文，您可以自行修改。"}
        </span>
      </label>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm">
            盒上產品名稱
            <span className={FIELD_HINT_CLASS}>可輸入</span>
          </span>
          <input
            value={boxName}
            maxLength={22}
            disabled={linkNames}
            placeholder="輸入盒上產品名稱…"
            onChange={(event) => onBoxName(event.target.value)}
            onFocus={() => onFocus("boxName")}
            onBlur={() => onFocus(null)}
            className={fieldClass(`mt-2 font-display text-2xl tracking-[0.12em] ${hasCjk(boxName) ? "" : "uppercase"}`)}
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
