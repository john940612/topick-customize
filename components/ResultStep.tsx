"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArtworkZoom } from "@/components/ArtworkZoom";
import { capOption, isCapColor, type CapColor } from "@/lib/caps";
import { normalizePhone, ORDER_ID_PATTERN, type ArtworkSlot, type OrderDraft } from "@/lib/orderRecord";
import { drawLabelCanvas, drawNamePlate, drawPhotoCanvas, drawSideAccent, loadImage } from "@/lib/packArt";
import type { CatalogProduct, DesignState, PhotoFrame } from "@/lib/types";

const SESSION_KEY = "topick-order-v1";
const sessionListeners = new Set<() => void>();

type StoredSession = { id: string; token: string; authPhone?: string };

function readOrderSession() {
  return sessionStorage.getItem(SESSION_KEY);
}

function writeOrderSession(value: StoredSession) {
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
    const parsed = JSON.parse(raw) as { id?: string; token?: string; authPhone?: string };
    if (parsed.id && ORDER_ID_PATTERN.test(parsed.id) && parsed.token) {
      const authPhone = normalizePhone(parsed.authPhone);
      return { id: parsed.id, token: parsed.token, ...(authPhone ? { authPhone } : {}) };
    }
  } catch {
    return null;
  }
  return null;
}

type Contact = { wechat: string; phone: string; shortName: string; quantity: string };
type ContactErrors = Partial<Record<keyof Contact, string>>;

const THUMBS: { slot: ArtworkSlot; label: string }[] = [
  { slot: "label", label: "標籤" },
  { slot: "photo", label: "盒面" },
  { slot: "name", label: "盒上名稱" },
  { slot: "side", label: "側板" },
];

export type RestoredDesign = {
  productId: string;
  concentration: number;
  labelName: string;
  boxName: string;
  sideTitle: string;
  capColor: CapColor;
  photo: PhotoFrame;
};

type Props = {
  product: CatalogProduct;
  design: DesignState;
  onRestore: (design: RestoredDesign) => boolean;
};

type ResumeOrder = {
  productId: string;
  concentration: number;
  labelName: string;
  boxName: string;
  sideTitle: string;
  photoAlt: string;
  capColor: string;
  wechat: string;
  phone: string;
  shortName: string;
  quantity: number;
};

export function ResultStep({ product, design, onRestore }: Props) {
  const percent = `${Math.round(design.concentration)}%`;
  const scent = product.seriesId === "wedding" ? product.nameEn : product.nameZh;
  const savedSession = useOrderSession();
  const orderId = savedSession?.id ?? null;
  const token = savedSession?.token ?? null;
  const [contact, setContact] = useState<Contact>({ wechat: "", phone: "", shortName: "", quantity: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [cardReady, setCardReady] = useState(false);
  const [lookupId, setLookupId] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading">("idle");
  const [thumbs, setThumbs] = useState<Partial<Record<ArtworkSlot, string>>>({});
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const photoUrl = useRef<string | null>(null);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    const created: string[] = [];
    void (async () => {
      const next: Partial<Record<ArtworkSlot, string>> = {};
      if (design.labelName.trim()) {
        next.label = URL.createObjectURL(await canvasFile(drawLabelCanvas(design.labelName), "label.png", "image/png"));
        created.push(next.label);
      }
      if (design.boxName.trim()) {
        next.name = URL.createObjectURL(await canvasFile(drawNamePlate(design.boxName), "name.png", "image/png"));
        created.push(next.name);
      }
      if (design.sideTitle.trim()) {
        next.side = URL.createObjectURL(await canvasFile(drawSideAccent(design.sideTitle), "side.png", "image/png"));
        created.push(next.side);
      }
      try {
        const photo = await loadImage(design.photo.src);
        next.photo = URL.createObjectURL(await canvasFile(drawPhotoCanvas(photo, design.photo), "photo.jpg", "image/jpeg"));
        created.push(next.photo);
      } catch {
        // The recap still shows the text if the photo cannot be drawn.
      }
      if (!cancelled) setThumbs(next);
    })();
    return () => {
      cancelled = true;
      for (const url of created) URL.revokeObjectURL(url);
    };
  }, [design]);

  useEffect(() => {
    if (cardReady) cardRef.current?.scrollIntoView({ block: "nearest" });
  }, [cardReady]);

  function updateField(field: keyof Contact, value: string) {
    setContact((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: ContactErrors = {};
    if (!contact.wechat.trim()) nextErrors.wechat = "請填寫微信帳號。";
    const phone = normalizePhone(contact.phone);
    if (!phone) nextErrors.phone = "請填寫 8 位電話號碼。";
    if (!contact.shortName.trim()) nextErrors.shortName = "請填寫簡稱。";
    const quantity = Number(contact.quantity);
    if (!contact.quantity.trim()) nextErrors.quantity = "請填寫要訂製多少個。";
    else if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9999) nextErrors.quantity = "數量請填 1 至 9999 的整數。";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !phone) return;

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
        concentrationZh: percent,
        concentrationEn: percent,
        labelName: design.labelName,
        boxName: design.boxName,
        sideTitle: design.sideTitle,
        photoAlt: design.photo.alt,
        capColor: design.capColor,
        wechat: contact.wechat.trim(),
        phone,
        shortName: contact.shortName.trim(),
        quantity,
      };
      const form = new FormData();
      form.set("meta", JSON.stringify(draft));
      if (orderId && token) {
        form.set("id", orderId);
        form.set("token", token);
        if (savedSession?.authPhone) form.set("authPhone", savedSession.authPhone);
      }
      if (design.labelName.trim()) form.set("label", await canvasFile(drawLabelCanvas(design.labelName), "label.png", "image/png"));
      if (design.boxName.trim()) form.set("name", await canvasFile(drawNamePlate(design.boxName), "name.png", "image/png"));
      if (design.sideTitle.trim()) form.set("side", await canvasFile(drawSideAccent(design.sideTitle), "side.png", "image/png"));
      const photo = await loadImage(design.photo.src);
      form.set("photo", await canvasFile(drawPhotoCanvas(photo, design.photo), "photo.jpg", "image/jpeg"));
      const response = await fetch("/api/orders", { method: "POST", body: form });
      const body = (await response.json()) as { id?: string; token?: string; error?: string };
      if (!response.ok || !body.id || !body.token) {
        throw new Error(body.error || "暫時未能提交。");
      }
      writeOrderSession({
        id: body.id,
        token: body.token,
        ...(savedSession?.authPhone ? { authPhone: phone } : {}),
      });
      setContact((current) => ({ ...current, phone }));
      setCardReady(true);
      setStatus("saved");
      setMessage(orderId ? "已更新同一張訂單。我們之後會聯絡你。" : "我們之後會聯絡你。");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "暫時未能提交。");
    }
  }

  async function lookup(event: React.FormEvent) {
    event.preventDefault();
    const phone = normalizePhone(lookupPhone);
    if (!phone) {
      setLookupError("請填寫 8 位電話號碼。");
      return;
    }
    setLookupStatus("loading");
    setLookupError("");
    try {
      const response = await fetch("/api/orders/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lookupId.trim(), phone: lookupPhone }),
      });
      const body = (await response.json()) as { id?: string; token?: string; order?: ResumeOrder; error?: string };
      if (!response.ok || !body.id || !body.token || !body.order) {
        throw new Error(body.error || "找不到訂單或電話不正確。");
      }
      const saved = await savedPhoto(body.id, body.token, body.order.photoAlt);
      const capColor = isCapColor(body.order.capColor) ? body.order.capColor : "white";
      const restored = onRestore({
        productId: body.order.productId,
        concentration: body.order.concentration,
        labelName: body.order.labelName,
        boxName: body.order.boxName,
        sideTitle: body.order.sideTitle,
        capColor,
        photo: saved,
      });
      if (!restored) {
        URL.revokeObjectURL(saved.src);
        throw new Error("暫時未能讀取訂單。");
      }
      if (photoUrl.current && photoUrl.current !== saved.src) URL.revokeObjectURL(photoUrl.current);
      photoUrl.current = saved.src;
      const savedPhone = normalizePhone(body.order.phone) ?? phone;
      writeOrderSession({ id: body.id, token: body.token, authPhone: savedPhone });
      setContact({
        wechat: body.order.wechat,
        phone: savedPhone,
        shortName: body.order.shortName,
        quantity: String(body.order.quantity),
      });
      setErrors({});
      setCardReady(true);
      setStatus("saved");
      setMessage("已讀取呢張訂單。你可以修改內容，再提交更新。");
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : "找不到訂單或電話不正確。");
    } finally {
      setLookupStatus("idle");
    }
  }

  const quantityText = quantityTextOf(contact.quantity);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">最後結果</p>
        <h2 className="mt-2 font-serif text-3xl">已收到你的訂製要求</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">請填寫微信帳號、電話、簡稱同要訂製多少個，我們之後會聯絡你。</p>
      </header>

      {cardReady && orderId ? (
        <section ref={cardRef} className="border border-line bg-ivory px-4 py-4 text-sm" role="status" aria-label="訂單">
          <p>
            訂單編號
            <span className="ml-2 font-display text-3xl tracking-[0.12em]">{orderId}</span>
          </p>
          <p className="mt-2 text-muted">{message || "我們之後會聯絡你。"}</p>
          <dl className="mt-4 space-y-2">
            <Recap label="瓶蓋" value={capOption(design.capColor).label} />
            <Recap label="數量" value={quantityText} />
            <Recap label="標籤名稱" value={design.labelName.trim() || "（未填）"} />
            <Recap label="盒上名稱" value={design.boxName.trim() || "（未填）"} />
            <Recap label="側板短句" value={design.sideTitle.trim() || "（未填）"} />
          </dl>
        </section>
      ) : null}

      <form onSubmit={(event) => void lookup(event)} className="space-y-4 border border-line bg-ivory px-4 py-4" noValidate>
        <p className="font-serif text-2xl">改返已有訂單</p>
        <p className="text-sm leading-relaxed text-muted">輸入訂單編號同電話，就可以改返之前嘅訂製。</p>
        <label className="block text-sm">
          訂單編號
          <input
            name="orderId"
            value={lookupId}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            onChange={(event) => {
              setLookupId(event.target.value);
              setLookupError("");
            }}
            className="mt-2 w-full border border-line bg-paper px-3 py-3 outline-none focus:border-ink"
          />
        </label>
        <label className="block text-sm">
          電話
          <input
            name="lookupPhone"
            value={lookupPhone}
            inputMode="numeric"
            autoComplete="tel"
            onChange={(event) => {
              setLookupPhone(event.target.value);
              setLookupError("");
            }}
            className="mt-2 w-full border border-line bg-paper px-3 py-3 outline-none focus:border-ink"
          />
        </label>
        {lookupError ? (
          <p role="alert" className="text-sm text-red-800">
            {lookupError}
          </p>
        ) : null}
        <button type="submit" disabled={lookupStatus === "loading"} className="h-11 border border-ink px-5 text-sm disabled:opacity-60">
          {lookupStatus === "loading" ? "讀取中…" : "讀取訂單"}
        </button>
      </form>

      <form onSubmit={(event) => void submit(event)} className="space-y-4" noValidate>
        <Field
          label="微信帳號"
          required
          name="wechat"
          value={contact.wechat}
          error={errors.wechat}
          autoComplete="username"
          onChange={(value) => updateField("wechat", value)}
        />
        <Field
          label="電話"
          required
          name="phone"
          value={contact.phone}
          error={errors.phone}
          autoComplete="tel"
          inputMode="numeric"
          onChange={(value) => updateField("phone", value)}
        />
        <Field
          label="簡稱"
          required
          name="shortName"
          value={contact.shortName}
          error={errors.shortName}
          autoComplete="nickname"
          onChange={(value) => updateField("shortName", value)}
        />
        <Field
          label="要訂製多少個"
          required
          name="quantity"
          value={contact.quantity}
          error={errors.quantity}
          autoComplete="off"
          inputMode="numeric"
          type="number"
          min={1}
          max={9999}
          step={1}
          onChange={(value) => updateField("quantity", value)}
        />
        {status === "error" && message ? (
          <p role="alert" className="text-sm text-red-800">
            {message}
          </p>
        ) : null}
        <button type="submit" disabled={status === "saving"} className="h-11 bg-ink px-5 text-sm text-ivory disabled:opacity-60">
          {status === "saving" ? "提交中…" : orderId ? "更新訂製" : "提交訂製"}
        </button>
      </form>

      <section className="border border-line bg-ivory px-4 py-4 text-sm" aria-label="訂製內容">
        <p className="font-serif text-2xl">{scent}</p>
        <p className="mt-1 text-muted">
          {product.nameEn !== scent ? `${product.nameEn} · ` : ""}
          濃度 {percent}
        </p>
        <div className="mt-4 flex gap-2">
          {THUMBS.map((thumb) =>
            thumbs[thumb.slot] ? (
              <button
                key={thumb.slot}
                type="button"
                onClick={() => setZoom({ src: thumbs[thumb.slot] as string, alt: thumb.label })}
                aria-label={`放大${thumb.label}`}
                className="h-16 w-16 border border-line"
              >
                <img src={thumbs[thumb.slot]} alt="" className="h-full w-full object-cover" />
              </button>
            ) : (
              <span key={thumb.slot} className="flex h-16 w-16 items-center justify-center border border-dashed border-line text-[11px] text-muted">
                {thumb.label}
              </span>
            ),
          )}
        </div>
      </section>
      {zoom ? <ArtworkZoom src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} /> : null}
    </div>
  );
}

async function savedPhoto(id: string, token: string, alt: string): Promise<PhotoFrame> {
  const response = await fetch(`/api/orders/artwork/${id}/photo`, {
    headers: { "x-order-token": token },
  });
  if (!response.ok) throw new Error("暫時未能讀取訂單。");
  const blob = await response.blob();
  const src = URL.createObjectURL(blob);
  try {
    const image = await loadImage(src);
    return {
      src,
      alt: alt || "盒面主圖",
      source: "upload",
      snap: true,
      zoom: 1,
      focusX: 0.5,
      focusY: 0.5,
      width: image.naturalWidth || 1218,
      height: image.naturalHeight || 1962,
    };
  } catch (error) {
    URL.revokeObjectURL(src);
    throw error;
  }
}

function quantityTextOf(value: string) {
  const quantity = Number(value);
  if (value.trim() && Number.isInteger(quantity) && quantity >= 1) return `${quantity} 個`;
  return value.trim();
}

function Field({
  label,
  name,
  value,
  error,
  autoComplete,
  inputMode,
  type = "text",
  min,
  max,
  step,
  required = false,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  error?: string;
  autoComplete: string;
  inputMode?: "tel" | "numeric";
  type?: "text" | "number";
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  const errorId = `${name}-error`;
  return (
    <label className="block text-sm">
      <span>
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-1 text-red-800">
              *
            </span>
            <span className="ml-1 text-xs text-muted">必填</span>
          </>
        ) : null}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        required={required}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-line bg-ivory px-3 py-3 outline-none focus:border-ink"
      />
      {error ? (
        <span id={errorId} className="mt-1 block text-red-800">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function Recap({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
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
