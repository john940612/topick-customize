"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { orderResumeUrl } from "@/lib/orderLink";

type Props = { orderId: string };

export function OrderQr({ orderId }: Props) {
  const url = orderResumeUrl(orderId);
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    void QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      margin: 4,
      width: 640,
      color: { dark: "#000000", light: "#ffffff" },
    }).then((dataUrl) => {
      if (!cancelled) setSrc(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!url || !src) return null;

  return (
    <figure className="mt-4 border border-line bg-white p-4 text-center">
      <img src={src} alt="改訂單二維碼" width={280} height={280} className="mx-auto h-auto w-[280px] max-w-full bg-white" />
      <figcaption className="mt-3 text-left text-sm leading-relaxed text-ink">
        儲存或者掃描呢個二維碼，之後可以返嚟改呢張訂單。掃完要輸入落單時嗰 8 位電話。
      </figcaption>
      <a href={src} download={`${orderId}-qr.png`} className="mt-3 inline-flex h-10 items-center border border-ink px-3 text-sm">
        儲存二維碼
      </a>
    </figure>
  );
}
