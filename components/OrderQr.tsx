"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import QRCode from "qrcode";
import { orderResumeUrl } from "@/lib/orderLink";

type Props = { orderId: string };

export function OrderQr({ orderId }: Props) {
  const url = orderResumeUrl(orderId);
  const album = useSyncExternalStore(subscribe, prefersPhotoAlbum, () => false);
  const [src, setSrc] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    void composeQrCard(url).then((dataUrl) => {
      if (!cancelled) setSrc(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  async function save() {
    if (!src) return;
    setNotice("");
    const file = pngFile(src, `${orderId}-qr.png`);
    if (prefersPhotoAlbum() && (await shareImage(file))) return;
    if (prefersPhotoAlbum()) {
      setNotice("未能打開分享。請再撳一次「儲存二維碼」，然後揀「儲存影像」。");
      return;
    }
    downloadPng(src, `${orderId}-qr.png`);
  }

  if (!url || !src) return null;

  return (
    <figure className="mt-4 border border-line bg-white p-4 text-center">
      <img src={src} alt="Topick 專屬訂製二維碼" width={280} height={360} className="mx-auto h-auto w-[280px] max-w-full bg-white" />
      <figcaption className="mt-3 text-left text-sm leading-relaxed text-ink">
        儲存或者掃描呢個二維碼，會打開改訂單頁。輸入落單時嗰 8 位電話，就可以改呢張訂單。
        {album ? " 撳「儲存二維碼」之後會打開分享，揀「儲存影像」就放入相簿。" : null}
      </figcaption>
      <button type="button" onClick={() => void save()} className="mt-3 inline-flex h-10 items-center border border-ink px-3 text-sm">
        儲存二維碼
      </button>
      {notice ? (
        <p role="status" className="mt-2 text-left text-sm text-red-800">
          {notice}
        </p>
      ) : null}
    </figure>
  );
}

async function composeQrCard(url: string) {
  await document.fonts.ready;
  const code = document.createElement("canvas");
  await QRCode.toCanvas(code, url, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 640,
    color: { dark: "#000000", light: "#ffffff" },
  });
  const pad = 48;
  const header = 210;
  const canvas = document.createElement("canvas");
  canvas.width = code.width + pad * 2;
  canvas.height = code.height + header + pad;
  const ctx = canvas.getContext("2d");
  if (!ctx) return code.toDataURL("image/png");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1b1814";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const display = getComputedStyle(document.documentElement).getPropertyValue("--font-cormorant").trim();
  const sans = getComputedStyle(document.documentElement).getPropertyValue("--font-noto").trim();
  ctx.letterSpacing = "0.28em";
  ctx.font = `500 72px ${display || "Times New Roman"}, serif`;
  ctx.fillText("TOPICK", canvas.width / 2, 78);
  ctx.letterSpacing = "0.22em";
  ctx.font = `500 40px ${sans || "PingFang HK"}, "Noto Sans TC", sans-serif`;
  ctx.fillText("專屬訂製", canvas.width / 2, 148);
  ctx.drawImage(code, pad, header);
  return canvas.toDataURL("image/png");
}

function subscribe() {
  return () => {};
}

function prefersPhotoAlbum() {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios || /Android/i.test(ua);
}

function pngFile(dataUrl: string, filename: string) {
  const [header, data] = dataUrl.split(",");
  const mime = /data:(.*?);/.exec(header)?.[1] ?? "image/png";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

async function shareImage(file: File) {
  const payload = { files: [file] };
  if (typeof navigator.share !== "function" || (navigator.canShare && !navigator.canShare(payload))) return false;
  try {
    await navigator.share(payload);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return true;
    return false;
  }
}

function downloadPng(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
